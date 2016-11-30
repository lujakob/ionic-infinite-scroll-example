
export const CONTENT_ITEMS_PER_PAGE = 100;
export const CONTENT_ITEMS_REDUNDANCE = 15;
/**
 * calculate next offset depending on current offset, total list items, first visible item on time of re-fetch
 * @param direction
 * @param currentOffset
 * @param total
 * @param firstVisibleIndex
 * @returns {number}
 */
export function getNewOffset(direction: string = '', currentOffset: number = 0, total: number = 0, firstVisibleIndex: number = 0): number {
    let newOffset = currentOffset;
    // items left over in list on time of reFetch
    let itemsLeft;

    // don't on first fetch
    if (direction !== '') {

        // fetch next items
        if (direction === 'next') {
            itemsLeft = (CONTENT_ITEMS_PER_PAGE - firstVisibleIndex);

            if ((currentOffset + CONTENT_ITEMS_PER_PAGE) < total) {
                // after this reFetch we still have more
                newOffset = currentOffset + CONTENT_ITEMS_PER_PAGE - (itemsLeft + CONTENT_ITEMS_REDUNDANCE);
            } else {
                // last reFetch
                newOffset = total - CONTENT_ITEMS_PER_PAGE;
            }
            // fetch prev items
        } else {
            if ((currentOffset - CONTENT_ITEMS_PER_PAGE) > 0) {
                // after this reFetch prev we have more available
                newOffset = currentOffset - CONTENT_ITEMS_PER_PAGE + CONTENT_ITEMS_REDUNDANCE;
            } else {
                // no more data before this prevFetch
                newOffset = 0;
            }
        }
    }

    return newOffset;
}

/**
 * get next enabled value (enable/disable pagination)
 * @param newOffset
 * @param total
 * @returns {boolean}
 */
export function getNextEnabled(newOffset, total): boolean {
    return (newOffset + CONTENT_ITEMS_PER_PAGE) < total;
}

/**
 * get prev enabled value (enable/disable pagination)
 * @param newOffset
 * @returns {boolean}
 */
export function getPrevEnabled(newOffset): boolean {
    return newOffset > 0;
}

/**
 * calculate startIndex depending on current state, total, first visible item on time of re-fetch
 * @param direction
 * @param currentOffset
 * @param total
 * @returns {number}
 */
export function getStartIndex(direction: string = '', currentOffset: number = 0, total: number = 0): number {
    let startIndex = 0;

    // don't on first fetch
    if (direction !== '') {

        // fetch next items
        if (direction === 'next') {
            if ((currentOffset + CONTENT_ITEMS_PER_PAGE) < total) {
                // after this reFetch we still have more
                startIndex = CONTENT_ITEMS_REDUNDANCE;
            } else {
                // last reFetch
                startIndex = CONTENT_ITEMS_PER_PAGE - (total - currentOffset);
            }
            // fetch prev items
        } else {
            if ((currentOffset - CONTENT_ITEMS_PER_PAGE) > 0) {
                // after this reFetch prev we have more available
                startIndex = CONTENT_ITEMS_PER_PAGE - CONTENT_ITEMS_REDUNDANCE;
            } else {
                // no more data before this prevFetch
                startIndex = currentOffset;
            }
        }
    }
    return startIndex;
}

/**
 * set index of first visible element in viewport for scroll position on point of doInfinite/reFetch
 * @param listScrollTop - list scrollTop px value
 * @param listItems - html list items
 * @returns {number}
 */
export function getFirstVisibleIndex(listScrollTop, listItems): number {
    for (var i = 0; i < listItems.length; i++) {
        if (listItems[i].offsetTop > listScrollTop) {
            return i;
        }
    }
}