/**
 * Returns whether the page is in LTR mode. Defaults to `true` if it can't be computed.
 *
 * @return {boolean} Page's language direction is left-to-right.
 */
export function isLTR() {
    let dir = 'ltr';
    if (typeof window !== 'undefined') {
        if (window.getComputedStyle) {
            dir = window.getComputedStyle(document.body, null).getPropertyValue('direction');
        }
        else {
            dir = document.body.currentStyle.direction;
        }
    }
    return dir === 'ltr';
}
/**
 * Returns whether or not the current device is an iOS device.
 *
 * @return {boolean} Device is an iOS device (i.e. iPod touch/iPhone/iPad).
 */
export function isIOS() {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxLQUFLO0lBQ25CLElBQUksR0FBRyxHQUFXLEtBQUssQ0FBQztJQUV4QixJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRSxDQUFDO1FBQ2xDLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDNUIsR0FBRyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25GLENBQUM7YUFBTSxDQUFDO1lBQ04sR0FBRyxHQUFJLFFBQVEsQ0FBQyxJQUFZLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQztRQUN0RCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sR0FBRyxLQUFLLEtBQUssQ0FBQztBQUN2QixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxLQUFLO0lBQ25CLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsRUFBRSxDQUFDO1FBQ3RFLE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFFLE1BQWMsQ0FBQyxRQUFRLENBQUM7SUFDbkYsQ0FBQztJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHRoZSBwYWdlIGlzIGluIExUUiBtb2RlLiBEZWZhdWx0cyB0byBgdHJ1ZWAgaWYgaXQgY2FuJ3QgYmUgY29tcHV0ZWQuXG4gKlxuICogQHJldHVybiB7Ym9vbGVhbn0gUGFnZSdzIGxhbmd1YWdlIGRpcmVjdGlvbiBpcyBsZWZ0LXRvLXJpZ2h0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNMVFIoKTogYm9vbGVhbiB7XG4gIGxldCBkaXI6IHN0cmluZyA9ICdsdHInO1xuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuICAgICAgZGlyID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZSgnZGlyZWN0aW9uJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpciA9IChkb2N1bWVudC5ib2R5IGFzIGFueSkuY3VycmVudFN0eWxlLmRpcmVjdGlvbjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGlyID09PSAnbHRyJztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBjdXJyZW50IGRldmljZSBpcyBhbiBpT1MgZGV2aWNlLlxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59IERldmljZSBpcyBhbiBpT1MgZGV2aWNlIChpLmUuIGlQb2QgdG91Y2gvaVBob25lL2lQYWQpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJT1MoKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiAvaVBhZHxpUGhvbmV8aVBvZC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAhKHdpbmRvdyBhcyBhbnkpLk1TU3RyZWFtO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuIl19