import {Directive, ElementRef, EventEmitter, Host, Input, NgZone, Output} from '@angular/core';

import {clearNativeTimeout, nativeTimeout} from 'ionic-angular/util/dom';

import {Content,ScrollEvent} from 'ionic-angular';

/**
 * @name InfiniteScroll
 * @description
 *
 * This code is basically copied from the original ionic infinite component and adapted to work in two ways
 *
 * if there is some double loading on scrolling back and forth, try to adjust the CONTENT_ITEMS_REDUNDANCE, make the window less high, or adjust customOffset
 */
@Directive({
  selector: 'two-way-infinite-scroll'
})
export class TwoWayInfiniteScroll {
  _lastCheck:number = 0;
  _highestY:number = 0;
  _scLsn:any;
  _thr:string = '1%';
  _thrPx:number = 1;
  _thrPc:number = 0;
  _init:boolean = false;
  _tmId:number;
  _oneLast:boolean;

  state:string = STATE_ENABLED;
  arrivedAt:string = 'bottom';
  stateBottom:string = STATE_ENABLED;
  stateTop:string = STATE_BLOCKED;


  /**
   * @input {string} The threshold distance from the bottom
   * of the content to call the `infinite` output event when scrolled.
   * The threshold value can be either a percent, or
   * in pixels. For example, use the value of `10%` for the `infinite`
   * output event to get called when the user has scrolled 10%
   * from the bottom of the page. Use the value `100px` when the
   * scroll is within 100 pixels from the bottom of the page.
   * Default is `15%`.
   */
  @Input()
  get threshold():string {
    return this._thr;
  }

  set threshold(val:string) {
    this._thr = val;
    if (val.indexOf('%') > -1) {
      this._thrPx = 0;
      this._thrPc = (parseFloat(val) / 100);

    } else {
      this._thrPx = parseFloat(val);
      this._thrPc = 0;
    }
  }

  /**
   * @output {event} The expression to call when the scroll reaches
   * the threshold distance. From within your infinite handler,
   * you must call the infinite scroll's `complete()` method when
   * your async operation has completed.
   */
  @Output() ionInfinite:EventEmitter<TwoWayInfiniteScroll> = new EventEmitter<TwoWayInfiniteScroll>();

  constructor(@Host() private _content:Content,
              private _zone:NgZone,
              private _elementRef:ElementRef) {
    _content.setElementClass('has-infinite-scroll', true);

  }

  _onScroll() {

    if (this.stateBottom === STATE_LOADING ||
      this.stateTop === STATE_LOADING ||
      (this.stateTop === STATE_DISABLED && this.stateBottom === STATE_DISABLED)) {
      // if (this.state === STATE_LOADING || this.state === STATE_DISABLED) {
      return 1;
    }

    let now = Date.now();

    if (!this._oneLast && this._lastCheck + 32 > now) {
      // no need to check less than every XXms
      return 2;
    }

    this._lastCheck = now;

    // call _onScroll one more time after scroll end, to make sure the last one didn't fall through the the 32ms

    if (!this._oneLast) {
      clearNativeTimeout(this._tmId);
      this._tmId = nativeTimeout(() => {
        this._oneLast = true;
        this._onScroll();
        // console.debug('ion-content scroll: run one more after scroll end');
      }, 100);
    } else {
      this._oneLast = false;
    }

    let infiniteHeight = this._elementRef.nativeElement.scrollHeight;

    if (!infiniteHeight) {
      // if there is no height of this element then do nothing
      return 3;
    }

    let d = this._content.getContentDimensions();

    let reloadY = d.contentHeight;
    if (this._thrPc) {
      reloadY += (reloadY * this._thrPc);
    } else {
      reloadY += this._thrPx;
    }

    // enable stateTop on scroll y > 100
    if (this.stateTop === STATE_DISABLED && d.scrollTop > RANGE_TOP) {
      this.stateTop = STATE_ENABLED;
    }

    // on arrive bottom
    // this value might be adjusted, depending on list item height and content container height
    let customOffset = 100;
    let distanceFromInfinite = ((d.scrollHeight - infiniteHeight) - d.scrollTop) - reloadY - customOffset;

    if (this.stateBottom === STATE_ENABLED && distanceFromInfinite < 0) {
      clearNativeTimeout(this._tmId);
      this._zone.run(() => {
        this.state = STATE_LOADING;
        this.stateBottom = STATE_LOADING;
        this.arrivedAt = 'bottom';
        this.ionInfinite.emit(this);
      });
      return 5;
    }

    // on arrive top
    if (this.stateTop === STATE_ENABLED && d.scrollTop < RANGE_TOP) {
      clearNativeTimeout(this._tmId);
      this._zone.run(() => {
        this.arrivedAt = 'top';
        this.stateTop = STATE_LOADING;
        this.ionInfinite.emit(this);
      });
      return 6;
    }

    return 7;
  }

  disableTop() {
    this.stateTop = STATE_BLOCKED;
  }

  disableBottom() {
    this.stateBottom = STATE_BLOCKED;
  }


  /**
   * Call `complete()` within the `infinite` output event handler when
   * your async operation has completed. For example, the `loading`
   * state is while the app is performing an asynchronous operation,
   * such as receiving more data from an AJAX request to add more items
   * to a data list. Once the data has been received and UI updated, you
   * then call this method to signify that the loading has completed.
   * This method will change the infinite scroll's state from `loading`
   * to `enabled`.
   */
  complete() {
    // disable/enable should be set manually with enableTop/enableBottom

    // if (this.arrivedAt === 'top') {
    //     this.stateTop = STATE_DISABLED;
    // } else {
    //     this.stateBottom = STATE_ENABLED;
    // }
  }

  /**
   * Call `enable(false)` to disable the infinite scroll from actively
   * trying to receive new data while scrolling. This method is useful
   * when it is known that there is no more data that can be added, and
   * the infinite scroll is no longer needed.
   * @param {boolean} shouldEnable  If the infinite scroll should be
   * enabled or not. Setting to `false` will remove scroll event listeners
   * and hide the display.
   */
  enable(shouldEnable:boolean) {
    this.state = (shouldEnable ? STATE_ENABLED : STATE_DISABLED);
    this._setListeners(shouldEnable);
  }

  enableTop(shouldEnable:boolean) {
    this.stateTop = (shouldEnable ? STATE_ENABLED : STATE_BLOCKED);
    // this._setListeners(shouldEnable);
  }

  enableBottom(shouldEnable:boolean) {
    this.stateBottom = (shouldEnable ? STATE_ENABLED : STATE_BLOCKED);
    // this._setListeners(shouldEnable);
  }

  _setListeners(shouldListen: boolean) {
    if (this._init) {
      if (shouldListen) {
        if (!this._scLsn) {
          this._scLsn = this._content.ionScroll.subscribe((ev: ScrollEvent) => {
            this._onScroll();
          });
        }
      } else {
        this._scLsn && this._scLsn.unsubscribe();
        this._scLsn = null;
      }
    }
  }

  /**
   * @private
   */
  ngAfterContentInit() {
    this._init = true;
    this._setListeners(this.state !== STATE_DISABLED);
  }

  /**
   * @private
   */
  ngOnDestroy() {
    this._setListeners(false);
  }

}

const STATE_ENABLED = 'enabled';
const STATE_DISABLED = 'disabled';
const STATE_BLOCKED = 'blocked';
const STATE_LOADING = 'loading';

const RANGE_TOP = 5;

