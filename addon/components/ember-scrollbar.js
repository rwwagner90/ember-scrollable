import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import { throttle } from '@ember/runloop';
import Component from '@ember/component';
import DomMixin from 'ember-lifeline/mixins/dom';
import layout from '../templates/components/ember-scrollbar';
import { styleify } from '../util/css';
import { THROTTLE_TIME_LESS_THAN_60_FPS_IN_MS } from './ember-scrollable';
import { capitalize } from '@ember/string';

const handleSelector = '.drag-handle';

/**
 * Handles displaying and moving the handle within the confines of it's template.
 * Has callbacks for intending to dragging and jump to particular positions.
 *
 * @class EmberScrollbar
 * @extends Ember.Component
 */
export default Component.extend(DomMixin, {
  layout,
  classNameBindings: [':tse-scrollbar', 'horizontal:horizontal:vertical'],
  onDrag() {},
  onJumpTo() {},
  onDragStart() {},
  onDragEnd() {},

  horizontal: false,
  handleSize: null,
  handleOffset: 0,

  offsetAttr: computed('horizontal', function () {
    return this.horizontal ? 'left' : 'top';
  }),

  jumpScrollOffsetAttr: computed('horizontal', function () {
    return this.horizontal ? 'offsetX' : 'offsetY';
  }),

  eventOffsetAttr: computed('horizontal', function () {
    return this.horizontal ? 'pageX' : 'pageY';
  }),

  sizeAttr: computed('horizontal', function () {
    return this.horizontal ? 'width' : 'height';
  }),

  handleStylesJSON: computed(
    'handleOffset',
    'handleSize',
    'horizontal',
    function () {
      const { handleOffset, handleSize } = this.getProperties(
        'handleOffset',
        'handleSize'
      );
      if (this.horizontal) {
        return { left: handleOffset + 'px', width: handleSize + 'px' };
      } else {
        return { top: handleOffset + 'px', height: handleSize + 'px' };
      }
    }
  ),

  handleStyles: computed(
    'handleStylesJSON.{top,left,width,height}',
    function () {
      return styleify(this.handleStylesJSON);
    }
  ),

  mouseDown(e) {
    this.jumpScroll(e);
  },

  startDrag(e) {
    // Preventing the event's default action stops text being
    // selectable during the drag.
    e.preventDefault();
    e.stopPropagation();

    const dragOffset = this._startDrag(e);
    this.set('dragOffset', dragOffset);
    this.onDragStart(e);
  },

  mouseUp() {
    this.endDrag();
  },

  didInsertElement() {
    this._super(...arguments);
    this.addEventListener(window, 'mousemove', (e) => {
      throttle(
        this,
        this.updateMouseOffset,
        e,
        THROTTLE_TIME_LESS_THAN_60_FPS_IN_MS
      );
    });
  },

  endDrag() {
    this.onDragEnd();
  },

  /**
   * Callback for the mouse move event. Update the mouse offsets given the new mouse position.
   *
   * @method updateMouseOffset
   * @param e
   * @private
   */
  updateMouseOffset(e) {
    const { pageX, pageY } = e;
    const mouseOffset = this.horizontal ? pageX : pageY;

    if (this.isDragging && isPresent(mouseOffset)) {
      this._drag(mouseOffset, this.dragOffset);
    }
  },

  /**
   * Handles when user clicks on scrollbar, but not on the actual handle, and the scroll should
   * jump to the selected position.
   *
   * @method jumpScroll
   * @param e
   */
  jumpScroll(e) {
    // If the drag handle element was pressed, don't do anything here.
    if (e.target === this.element.querySelector(handleSelector)) {
      return;
    }
    this._jumpScroll(e);
  },

  // private methods
  /**
   * Convert the mouse position into a percentage of the scrollbar height/width.
   * and sends to parent
   *
   * @param eventOffset
   * @param dragOffset
   * @private
   */
  _drag(eventOffset, dragOffset) {
    const scrollbarOffset = this._scrollbarOffset();
    let dragPos = eventOffset - scrollbarOffset - dragOffset;
    // Convert the mouse position into a percentage of the scrollbar height/width.
    let dragPerc = dragPos / this._scrollbarSize();
    this.onDrag(dragPerc);
  },

  /**
   * Calls `onJumpTo` action with a boolean indicating the direction of the jump, and the jQuery MouseDown event.
   *
   * If towardsAnchor is true, the jump is in a direction towards from the initial anchored position of the scrollbar.
   *  i.e. for a vertical scrollbar, towardsAnchor=true indicates moving upwards, and towardsAnchor=false is downwards
   *       for a horizontal scrollbar, towardsAnchor=true indicates moving left, and towardsAnchor=false is right
   *
   * @param e
   * @private
   */
  _jumpScroll(e) {
    let eventOffset = this._jumpScrollEventOffset(e);
    let handleOffset = this._handlePositionOffset();
    const towardsAnchor = eventOffset < handleOffset;

    this.onJumpTo(towardsAnchor, e);
  },

  _startDrag(e) {
    return this._eventOffset(e) - this._handleOffset();
  },

  _handleOffset() {
    return this.element.querySelector(handleSelector).getBoundingClientRect()[
      this.offsetAttr
    ];
  },

  _handlePositionOffset() {
    let el = this.element.querySelector(handleSelector);
    let position = {
      left: el.offsetLeft,
      top: el.offsetTop,
    };

    return position[this.offsetAttr];
  },

  _scrollbarOffset() {
    return this.element.getBoundingClientRect()[this.offsetAttr];
  },

  /**
   * Returns the offset from the anchor point derived from this MouseEvent
   * @param e MouseEvent
   * @return {Number}
   */
  _jumpScrollEventOffset(e) {
    return e[this.jumpScrollOffsetAttr];
  },

  _eventOffset(e) {
    return e[this.eventOffsetAttr];
  },

  _scrollbarSize() {
    return this.element[`offset${capitalize(this.sizeAttr)}`];
  },

  actions: {
    startDrag() {
      this.startDrag(...arguments);
    },
  },
});
