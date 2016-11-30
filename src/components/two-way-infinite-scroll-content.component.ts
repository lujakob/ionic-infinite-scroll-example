import { Component, Input, ViewEncapsulation } from '@angular/core';

import { Config } from 'ionic-angular';
import { TwoWayInfiniteScroll } from './two-way-infinite-scroll.component';

/**
 * @private
 */
@Component({
    selector: 'two-way-infinite-scroll-content',
    template: '<div class="infinite-loading"></div>',
    host: {
        '[attr.state]': 'inf.state'
    },
    encapsulation: ViewEncapsulation.None,
})
export class TwoWayInfiniteScrollContent {

    /**
     * @input {string} An animated SVG spinner that shows while loading.
     */
    @Input() loadingSpinner: string;

    /**
     * @input {string} Optional text to display while loading.
     */
    @Input() loadingText: string;

    constructor(public inf: TwoWayInfiniteScroll, private _config: Config) {}

    /**
     * @private
     */
    ngOnInit() {
        if (!this.loadingSpinner) {
            this.loadingSpinner = this._config.get('infiniteLoadingSpinner', this._config.get('spinner', 'ios'));
        }
    }
}
