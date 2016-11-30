import { Component, ViewChild } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { LoadingController, Loading, Content } from 'ionic-angular';
import { TwoWayInfiniteScroll } from '../../components/two-way-infinite-scroll.component';
import { CONTENT_ITEMS_PER_PAGE } from '../../utils/content.utils';
import { getNewOffset, getNextEnabled, getPrevEnabled, getStartIndex, getFirstVisibleIndex  } from '../../utils/content.utils';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public clients: any;
  private loading: Loading;

  private currentOffset: number = 0;
  private startIndex: number = 0;
  private total: number = 0;

  @ViewChild(TwoWayInfiniteScroll) infiniteScroll: TwoWayInfiniteScroll;
  @ViewChild(Content) content: Content;
  @ViewChild('contentListParent') contentListParent;

  constructor(private contentService: ContentService, private loadingCtrl: LoadingController) {
  }

  ionViewDidEnter() {
    this.loadData();
  }

  /**
   * reset currentOffset and total and disable infinite scrolling
   */
  ionViewDidLeave() {
    this.clients = [];
    this.currentOffset = 0;
    this.total = 0;
    this.infiniteScroll.enableTop(false);
    this.infiniteScroll.enableBottom(false);
  }

  /**
   *
   * @param direction
   * @param firstVisibleIndex
   */
  loadData(direction: string = '', firstVisibleIndex: number = 0) {
    let endpoint = 'http://localhost:3333/clients/';

    // get list item start index to be able to scroll to current index after new data as arrived
    this.startIndex = getStartIndex(direction, this.currentOffset, this.total);
    // store current offset for calculations
    this.currentOffset = getNewOffset(direction, this.currentOffset, this.total, firstVisibleIndex);

    let url = endpoint + '?start=' + this.currentOffset + '&count=' + CONTENT_ITEMS_PER_PAGE;

    // show loading
    this.loading = this.loadingCtrl.create({content: 'Please wait...'});
    this.loading.present();

    // fetch content
    this.contentService.getContent(url).subscribe(data => {
      // hide loading
      this.loading.dismiss();

      if (data.data) {
        this.total = data.total;
        // hide parent container's
        this.contentListParent.nativeElement.style.visibility = 'hidden';

        // delay for new items to be updated in the DOM and prevent flickering
        setTimeout(() => {
          // scroll to start index after data is loaded
          this.scrollContent(this.startIndex);
          this.contentListParent.nativeElement.style.visibility = 'visible';
          this.setEnableInfinite(this.total, this.currentOffset);
        }, 200);

        this.clients = data.data;
      }
    });
  }

  /**
   * doInfinite - load prev or next paginated data, depending on scroll direction
   * @param infiniteScroll
   */
  doInfinite(infiniteScroll) {
    let direction = (infiniteScroll.arrivedAt === 'bottom') ? 'next' : 'prev';
    let listScrollTop = this.content.getNativeElement().children[1].scrollTop;
    let listItems = this.contentListParent.nativeElement.querySelectorAll('ion-item');

    this.loadData(direction, getFirstVisibleIndex(listScrollTop, listItems));
  }

  /**
   * setEnableInfinite - enable/disable infinite scrolling
   */
  setEnableInfinite(total: number = 0, currentOffset: number = 0) {
    let prevEnabled = getPrevEnabled(currentOffset);
    let nextEnabled = getNextEnabled(currentOffset, total);
    this.infiniteScroll.enableTop(prevEnabled);
    this.infiniteScroll.enableBottom(nextEnabled);
  }

  /**
   * scrollContent - scrolls content list to proper position after reload
   * @param startIndex
   */
  scrollContent(startIndex: number = 0) {
    let listItems = this.contentListParent.nativeElement.querySelectorAll('ion-item');
    let offsetTop = !!listItems[startIndex] && startIndex > 0 ? listItems[startIndex].offsetTop : 0;
    this.content.scrollTo(0, offsetTop, 0);
  }

}
