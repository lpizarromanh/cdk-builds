/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('@angular/cdk/platform'), require('rxjs'), require('@angular/cdk/bidi'), require('@angular/cdk/scrolling'), require('rxjs/operators'), require('@angular/cdk/coercion')) :
	typeof define === 'function' && define.amd ? define('@angular/cdk/dragDrop', ['exports', '@angular/core', '@angular/common', '@angular/cdk/platform', 'rxjs', '@angular/cdk/bidi', '@angular/cdk/scrolling', 'rxjs/operators', '@angular/cdk/coercion'], factory) :
	(factory((global.ng = global.ng || {}, global.ng.cdk = global.ng.cdk || {}, global.ng.cdk.dragDrop = {}),global.ng.core,global.ng.common,global.ng.cdk.platform,global.rxjs,global.ng.cdk.bidi,global.ng.cdk.scrolling,global.rxjs.operators,global.ng.cdk.coercion));
}(this, (function (exports,core,common,platform,rxjs,bidi,scrolling,operators,coercion) { 'use strict';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Shallow-extends a stylesheet object with another stylesheet object.
 * \@docs-private
 * @param {?} dest
 * @param {?} source
 * @return {?}
 */
function extendStyles(dest, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            dest[/** @type {?} */ (key)] = source[/** @type {?} */ (key)];
        }
    }
    return dest;
}
/**
 * Toggles whether the native drag interactions should be enabled for an element.
 * \@docs-private
 * @param {?} element Element on which to toggle the drag interactions.
 * @param {?} enable Whether the drag interactions should be enabled.
 * @return {?}
 */
function toggleNativeDragInteractions(element, enable) {
    /** @type {?} */
    var userSelect = enable ? '' : 'none';
    extendStyles(element.style, {
        touchAction: enable ? '' : 'none',
        webkitUserDrag: enable ? '' : 'none',
        webkitTapHighlightColor: enable ? '' : 'transparent',
        userSelect: userSelect,
        msUserSelect: userSelect,
        webkitUserSelect: userSelect,
        MozUserSelect: userSelect
    });
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 * Event options that can be used to bind an active event.
  @type {?} */
var activeEventOptions = platform.supportsPassiveEventListeners() ? { passive: false } : false;
// unsupported: template constraints.
/**
 * Service that keeps track of all the drag item and drop container
 * instances, and manages global event listeners on the `document`.
 * \@docs-private
 * @template I, C
 */
var DragDropRegistry = /** @class */ (function () {
    function DragDropRegistry(_ngZone, _document) {
        var _this = this;
        this._ngZone = _ngZone;
        /**
         * Registered drop container instances.
         */
        this._dropInstances = new Set();
        /**
         * Registered drag item instances.
         */
        this._dragInstances = new Set();
        /**
         * Drag item instances that are currently being dragged.
         */
        this._activeDragInstances = new Set();
        /**
         * Keeps track of the event listeners that we've bound to the `document`.
         */
        this._globalListeners = new Map();
        /**
         * Emits the `touchmove` or `mousemove` events that are dispatched
         * while the user is dragging a drag item instance.
         */
        this.pointerMove = new rxjs.Subject();
        /**
         * Emits the `touchend` or `mouseup` events that are dispatched
         * while the user is dragging a drag item instance.
         */
        this.pointerUp = new rxjs.Subject();
        /**
         * Listener used to prevent `touchmove` events while the element is being dragged.
         * This gets bound once, ahead of time, because WebKit won't preventDefault on a
         * dynamically-added `touchmove` listener. See https://bugs.webkit.org/show_bug.cgi?id=184250.
         */
        this._preventScrollListener = function (event) {
            if (_this._activeDragInstances.size) {
                event.preventDefault();
            }
        };
        this._document = _document;
    }
    /** Adds a drop container to the registry. */
    /**
     * Adds a drop container to the registry.
     * @param {?} drop
     * @return {?}
     */
    DragDropRegistry.prototype.registerDropContainer = /**
     * Adds a drop container to the registry.
     * @param {?} drop
     * @return {?}
     */
    function (drop) {
        if (!this._dropInstances.has(drop)) {
            if (this.getDropContainer(drop.id)) {
                throw Error("Drop instance with id \"" + drop.id + "\" has already been registered.");
            }
            this._dropInstances.add(drop);
        }
    };
    /** Adds a drag item instance to the registry. */
    /**
     * Adds a drag item instance to the registry.
     * @param {?} drag
     * @return {?}
     */
    DragDropRegistry.prototype.registerDragItem = /**
     * Adds a drag item instance to the registry.
     * @param {?} drag
     * @return {?}
     */
    function (drag) {
        var _this = this;
        this._dragInstances.add(drag);
        if (this._dragInstances.size === 1) {
            this._ngZone.runOutsideAngular(function () {
                // The event handler has to be explicitly active, because
                // newer browsers make it passive by default.
                _this._document.addEventListener('touchmove', _this._preventScrollListener, activeEventOptions);
            });
        }
    };
    /** Removes a drop container from the registry. */
    /**
     * Removes a drop container from the registry.
     * @param {?} drop
     * @return {?}
     */
    DragDropRegistry.prototype.removeDropContainer = /**
     * Removes a drop container from the registry.
     * @param {?} drop
     * @return {?}
     */
    function (drop) {
        this._dropInstances.delete(drop);
    };
    /** Removes a drag item instance from the registry. */
    /**
     * Removes a drag item instance from the registry.
     * @param {?} drag
     * @return {?}
     */
    DragDropRegistry.prototype.removeDragItem = /**
     * Removes a drag item instance from the registry.
     * @param {?} drag
     * @return {?}
     */
    function (drag) {
        this._dragInstances.delete(drag);
        this.stopDragging(drag);
        if (this._dragInstances.size === 0) {
            this._document.removeEventListener('touchmove', this._preventScrollListener, /** @type {?} */ (activeEventOptions));
        }
    };
    /**
     * Starts the dragging sequence for a drag instance.
     * @param drag Drag instance which is being dragged.
     * @param event Event that initiated the dragging.
     */
    /**
     * Starts the dragging sequence for a drag instance.
     * @param {?} drag Drag instance which is being dragged.
     * @param {?} event Event that initiated the dragging.
     * @return {?}
     */
    DragDropRegistry.prototype.startDragging = /**
     * Starts the dragging sequence for a drag instance.
     * @param {?} drag Drag instance which is being dragged.
     * @param {?} event Event that initiated the dragging.
     * @return {?}
     */
    function (drag, event) {
        var _this = this;
        this._activeDragInstances.add(drag);
        if (this._activeDragInstances.size === 1) {
            /** @type {?} */
            var isTouchEvent = event.type.startsWith('touch');
            /** @type {?} */
            var moveEvent = isTouchEvent ? 'touchmove' : 'mousemove';
            /** @type {?} */
            var upEvent = isTouchEvent ? 'touchend' : 'mouseup';
            // We need to disable the native interactions on the entire body, because
            // the user can start marking text if they drag too far in Safari.
            toggleNativeDragInteractions(this._document.body, false);
            // We explicitly bind __active__ listeners here, because newer browsers will default to
            // passive ones for `mousemove` and `touchmove`. The events need to be active, because we
            // use `preventDefault` to prevent the page from scrolling while the user is dragging.
            this._globalListeners
                .set(moveEvent, { handler: function (e) { return _this.pointerMove.next(e); }, options: activeEventOptions })
                .set(upEvent, { handler: function (e) { return _this.pointerUp.next(e); } })
                .forEach(function (config, name) {
                _this._ngZone.runOutsideAngular(function () {
                    _this._document.addEventListener(name, config.handler, config.options);
                });
            });
        }
    };
    /** Stops dragging a drag item instance. */
    /**
     * Stops dragging a drag item instance.
     * @param {?} drag
     * @return {?}
     */
    DragDropRegistry.prototype.stopDragging = /**
     * Stops dragging a drag item instance.
     * @param {?} drag
     * @return {?}
     */
    function (drag) {
        this._activeDragInstances.delete(drag);
        if (this._activeDragInstances.size === 0) {
            this._clearGlobalListeners();
            toggleNativeDragInteractions(this._document.body, true);
        }
    };
    /** Gets whether a drag item instance is currently being dragged. */
    /**
     * Gets whether a drag item instance is currently being dragged.
     * @param {?} drag
     * @return {?}
     */
    DragDropRegistry.prototype.isDragging = /**
     * Gets whether a drag item instance is currently being dragged.
     * @param {?} drag
     * @return {?}
     */
    function (drag) {
        return this._activeDragInstances.has(drag);
    };
    /** Gets a drop container by its id. */
    /**
     * Gets a drop container by its id.
     * @param {?} id
     * @return {?}
     */
    DragDropRegistry.prototype.getDropContainer = /**
     * Gets a drop container by its id.
     * @param {?} id
     * @return {?}
     */
    function (id) {
        return Array.from(this._dropInstances).find(function (instance) { return instance.id === id; });
    };
    /**
     * @return {?}
     */
    DragDropRegistry.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this._dragInstances.forEach(function (instance) { return _this.removeDragItem(instance); });
        this._dropInstances.forEach(function (instance) { return _this.removeDropContainer(instance); });
        this._clearGlobalListeners();
        this.pointerMove.complete();
        this.pointerUp.complete();
    };
    /**
     * Clears out the global event listeners from the `document`.
     * @return {?}
     */
    DragDropRegistry.prototype._clearGlobalListeners = /**
     * Clears out the global event listeners from the `document`.
     * @return {?}
     */
    function () {
        var _this = this;
        this._globalListeners.forEach(function (config, name) {
            _this._document.removeEventListener(name, config.handler, config.options);
        });
        this._globalListeners.clear();
    };
    DragDropRegistry.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */
    DragDropRegistry.ctorParameters = function () { return [
        { type: core.NgZone },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] }
    ]; };
    /** @nocollapse */ DragDropRegistry.ngInjectableDef = core.defineInjectable({ factory: function DragDropRegistry_Factory() { return new DragDropRegistry(core.inject(core.NgZone), core.inject(common.DOCUMENT)); }, token: DragDropRegistry, providedIn: "root" });
    return DragDropRegistry;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Handle that can be used to drag and CdkDrag instance.
 */
var CdkDragHandle = /** @class */ (function () {
    function CdkDragHandle(element) {
        this.element = element;
        toggleNativeDragInteractions(element.nativeElement, false);
    }
    CdkDragHandle.decorators = [
        { type: core.Directive, args: [{
                    selector: '[cdkDragHandle]',
                    host: {
                        'class': 'cdk-drag-handle'
                    }
                },] },
    ];
    /** @nocollapse */
    CdkDragHandle.ctorParameters = function () { return [
        { type: core.ElementRef }
    ]; };
    return CdkDragHandle;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Element that will be used as a template for the placeholder of a CdkDrag when
 * it is being dragged. The placeholder is displayed in place of the element being dragged.
 * @template T
 */
var CdkDragPlaceholder = /** @class */ (function () {
    function CdkDragPlaceholder(templateRef) {
        this.templateRef = templateRef;
    }
    CdkDragPlaceholder.decorators = [
        { type: core.Directive, args: [{
                    selector: 'ng-template[cdkDragPlaceholder]'
                },] },
    ];
    /** @nocollapse */
    CdkDragPlaceholder.ctorParameters = function () { return [
        { type: core.TemplateRef }
    ]; };
    CdkDragPlaceholder.propDecorators = {
        data: [{ type: core.Input }]
    };
    return CdkDragPlaceholder;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Element that will be used as a template for the preview
 * of a CdkDrag when it is being dragged.
 * @template T
 */
var CdkDragPreview = /** @class */ (function () {
    function CdkDragPreview(templateRef) {
        this.templateRef = templateRef;
    }
    CdkDragPreview.decorators = [
        { type: core.Directive, args: [{
                    selector: 'ng-template[cdkDragPreview]'
                },] },
    ];
    /** @nocollapse */
    CdkDragPreview.ctorParameters = function () { return [
        { type: core.TemplateRef }
    ]; };
    CdkDragPreview.propDecorators = {
        data: [{ type: core.Input }]
    };
    return CdkDragPreview;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 * Injection token that is used to provide a CdkDrop instance to CdkDrag.
 * Used for avoiding circular imports.
  @type {?} */
var CDK_DROP_CONTAINER = new core.InjectionToken('CDK_DROP_CONTAINER');

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * Parses a CSS time value to milliseconds.
 * @param {?} value
 * @return {?}
 */
function parseCssTimeUnitsToMs(value) {
    /** @type {?} */
    var multiplier = value.toLowerCase().indexOf('ms') > -1 ? 1 : 1000;
    return parseFloat(value) * multiplier;
}
/**
 * Gets the transform transition duration, including the delay, of an element in milliseconds.
 * @param {?} element
 * @return {?}
 */
function getTransformTransitionDurationInMs(element) {
    /** @type {?} */
    var computedStyle = getComputedStyle(element);
    /** @type {?} */
    var transitionedProperties = parseCssPropertyValue(computedStyle, 'transition-property');
    /** @type {?} */
    var property = transitionedProperties.find(function (prop) { return prop === 'transform' || prop === 'all'; });
    // If there's no transition for `all` or `transform`, we shouldn't do anything.
    if (!property) {
        return 0;
    }
    /** @type {?} */
    var propertyIndex = transitionedProperties.indexOf(property);
    /** @type {?} */
    var rawDurations = parseCssPropertyValue(computedStyle, 'transition-duration');
    /** @type {?} */
    var rawDelays = parseCssPropertyValue(computedStyle, 'transition-delay');
    return parseCssTimeUnitsToMs(rawDurations[propertyIndex]) +
        parseCssTimeUnitsToMs(rawDelays[propertyIndex]);
}
/**
 * Parses out multiple values from a computed style into an array.
 * @param {?} computedStyle
 * @param {?} name
 * @return {?}
 */
function parseCssPropertyValue(computedStyle, name) {
    /** @type {?} */
    var value = computedStyle.getPropertyValue(name);
    return value.split(',').map(function (part) { return part.trim(); });
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 * Injection token that can be used to configure the behavior of `CdkDrag`.
  @type {?} */
var CDK_DRAG_CONFIG = new core.InjectionToken('CDK_DRAG_CONFIG', {
    providedIn: 'root',
    factory: CDK_DRAG_CONFIG_FACTORY
});
/**
 * \@docs-private
 * @return {?}
 */
function CDK_DRAG_CONFIG_FACTORY() {
    return { dragStartThreshold: 5, pointerDirectionChangeThreshold: 5 };
}
/**
 * Element that can be moved inside a CdkDrop container.
 * @template T
 */
var CdkDrag = /** @class */ (function () {
    function CdkDrag(element, /** Droppable container that the draggable is a part of. */
    dropContainer, document, _ngZone, _viewContainerRef, _viewportRuler, _dragDropRegistry, _config, _dir) {
        var _this = this;
        this.element = element;
        this.dropContainer = dropContainer;
        this._ngZone = _ngZone;
        this._viewContainerRef = _viewContainerRef;
        this._viewportRuler = _viewportRuler;
        this._dragDropRegistry = _dragDropRegistry;
        this._config = _config;
        this._dir = _dir;
        /**
         * CSS `transform` applied to the element when it isn't being dragged. We need a
         * passive transform in order for the dragged element to retain its new position
         * after the user has stopped dragging and because we need to know the relative
         * position in case they start dragging again. This corresponds to `element.style.transform`.
         */
        this._passiveTransform = { x: 0, y: 0 };
        /**
         * CSS `transform` that is applied to the element while it's being dragged.
         */
        this._activeTransform = { x: 0, y: 0 };
        /**
         * Emits when the item is being moved.
         */
        this._moveEvents = new rxjs.Subject();
        /**
         * Amount of subscriptions to the move event. Used to avoid
         * hitting the zone if the consumer didn't subscribe to it.
         */
        this._moveEventSubscriptions = 0;
        /**
         * Subscription to pointer movement events.
         */
        this._pointerMoveSubscription = rxjs.Subscription.EMPTY;
        /**
         * Subscription to the event that is dispatched when the user lifts their pointer.
         */
        this._pointerUpSubscription = rxjs.Subscription.EMPTY;
        /**
         * Emits when the user starts dragging the item.
         */
        this.started = new core.EventEmitter();
        /**
         * Emits when the user stops dragging an item in the container.
         */
        this.ended = new core.EventEmitter();
        /**
         * Emits when the user has moved the item into a new container.
         */
        this.entered = new core.EventEmitter();
        /**
         * Emits when the user removes the item its container by dragging it into another container.
         */
        this.exited = new core.EventEmitter();
        /**
         * Emits when the user drops the item inside a container.
         */
        this.dropped = new core.EventEmitter();
        /**
         * Emits as the user is dragging the item. Use with caution,
         * because this event will fire for every pixel that the user has dragged.
         */
        this.moved = rxjs.Observable.create(function (observer) {
            /** @type {?} */
            var subscription = _this._moveEvents.subscribe(observer);
            _this._moveEventSubscriptions++;
            return function () {
                subscription.unsubscribe();
                _this._moveEventSubscriptions--;
            };
        });
        /**
         * Handler for the `mousedown`/`touchstart` events.
         */
        this._pointerDown = function (event) {
            // Delegate the event based on whether it started from a handle or the element itself.
            if (_this._handles.length) {
                /** @type {?} */
                var targetHandle = _this._handles.find(function (handle) {
                    /** @type {?} */
                    var element = handle.element.nativeElement;
                    /** @type {?} */
                    var target = event.target;
                    return !!target && (target === element || element.contains(/** @type {?} */ (target)));
                });
                if (targetHandle) {
                    _this._initializeDragSequence(targetHandle.element.nativeElement, event);
                }
            }
            else {
                _this._initializeDragSequence(_this._rootElement, event);
            }
        };
        /**
         * Handler that is invoked when the user moves their pointer after they've initiated a drag.
         */
        this._pointerMove = function (event) {
            /** @type {?} */
            var pointerPosition = _this._getConstrainedPointerPosition(event);
            if (!_this._hasStartedDragging) {
                /** @type {?} */
                var distanceX = Math.abs(pointerPosition.x - _this._pickupPositionOnPage.x);
                /** @type {?} */
                var distanceY = Math.abs(pointerPosition.y - _this._pickupPositionOnPage.y);
                /** @type {?} */
                var minimumDistance = _this._config.dragStartThreshold;
                // Only start dragging after the user has moved more than the minimum distance in either
                // direction. Note that this is preferrable over doing something like `skip(minimumDistance)`
                // in the `pointerMove` subscription, because we're not guaranteed to have one move event
                // per pixel of movement (e.g. if the user moves their pointer quickly).
                if (distanceX + distanceY >= minimumDistance) {
                    _this._hasStartedDragging = true;
                    _this._ngZone.run(function () { return _this._startDragSequence(); });
                }
                return;
            }
            _this._hasMoved = true;
            event.preventDefault();
            _this._updatePointerDirectionDelta(pointerPosition);
            if (_this.dropContainer) {
                _this._updateActiveDropContainer(pointerPosition);
            }
            else {
                /** @type {?} */
                var activeTransform = _this._activeTransform;
                activeTransform.x =
                    pointerPosition.x - _this._pickupPositionOnPage.x + _this._passiveTransform.x;
                activeTransform.y =
                    pointerPosition.y - _this._pickupPositionOnPage.y + _this._passiveTransform.y;
                _this._setTransform(_this._rootElement, activeTransform.x, activeTransform.y);
            }
            // Since this event gets fired for every pixel while dragging, we only
            // want to fire it if the consumer opted into it. Also we have to
            // re-enter the zone because we run all of the events on the outside.
            if (_this._moveEventSubscriptions > 0) {
                _this._ngZone.run(function () {
                    _this._moveEvents.next({
                        source: _this,
                        pointerPosition: pointerPosition,
                        event: event,
                        delta: _this._pointerDirectionDelta
                    });
                });
            }
        };
        /**
         * Handler that is invoked when the user lifts their pointer up, after initiating a drag.
         */
        this._pointerUp = function () {
            if (!_this._isDragging()) {
                return;
            }
            _this._removeSubscriptions();
            _this._dragDropRegistry.stopDragging(_this);
            if (!_this._hasStartedDragging) {
                return;
            }
            if (!_this.dropContainer) {
                // Convert the active transform into a passive one. This means that next time
                // the user starts dragging the item, its position will be calculated relatively
                // to the new passive transform.
                _this._passiveTransform.x = _this._activeTransform.x;
                _this._passiveTransform.y = _this._activeTransform.y;
                _this._ngZone.run(function () { return _this.ended.emit({ source: _this }); });
                return;
            }
            _this._animatePreviewToPlaceholder().then(function () { return _this._cleanupDragArtifacts(); });
        };
        this._document = document;
        _dragDropRegistry.registerDragItem(this);
    }
    /**
     * Returns the element that is being used as a placeholder
     * while the current element is being dragged.
     */
    /**
     * Returns the element that is being used as a placeholder
     * while the current element is being dragged.
     * @return {?}
     */
    CdkDrag.prototype.getPlaceholderElement = /**
     * Returns the element that is being used as a placeholder
     * while the current element is being dragged.
     * @return {?}
     */
    function () {
        return this._placeholder;
    };
    /** Returns the root draggable element. */
    /**
     * Returns the root draggable element.
     * @return {?}
     */
    CdkDrag.prototype.getRootElement = /**
     * Returns the root draggable element.
     * @return {?}
     */
    function () {
        return this._rootElement;
    };
    /**
     * @return {?}
     */
    CdkDrag.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        // We need to wait for the zone to stabilize, in order for the reference
        // element to be in the proper place in the DOM. This is mostly relevant
        // for draggable elements inside portals since they get stamped out in
        // their original DOM position and then they get transferred to the portal.
        this._ngZone.onStable.asObservable().pipe(operators.take(1)).subscribe(function () {
            /** @type {?} */
            var rootElement = _this._rootElement = _this._getRootElement();
            rootElement.addEventListener('mousedown', _this._pointerDown);
            rootElement.addEventListener('touchstart', _this._pointerDown);
            toggleNativeDragInteractions(rootElement, false);
        });
    };
    /**
     * @return {?}
     */
    CdkDrag.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._rootElement.removeEventListener('mousedown', this._pointerDown);
        this._rootElement.removeEventListener('touchstart', this._pointerDown);
        this._destroyPreview();
        this._destroyPlaceholder();
        // Do this check before removing from the registry since it'll
        // stop being considered as dragged once it is removed.
        if (this._isDragging()) {
            // Since we move out the element to the end of the body while it's being
            // dragged, we have to make sure that it's removed if it gets destroyed.
            this._removeElement(this._rootElement);
        }
        this._nextSibling = null;
        this._dragDropRegistry.removeDragItem(this);
        this._removeSubscriptions();
        this._moveEvents.complete();
    };
    /** Checks whether the element is currently being dragged. */
    /**
     * Checks whether the element is currently being dragged.
     * @return {?}
     */
    CdkDrag.prototype._isDragging = /**
     * Checks whether the element is currently being dragged.
     * @return {?}
     */
    function () {
        return this._dragDropRegistry.isDragging(this);
    };
    /**
     * Sets up the different variables and subscriptions
     * that will be necessary for the dragging sequence.
     * @param {?} referenceElement Element that started the drag sequence.
     * @param {?} event Browser event object that started the sequence.
     * @return {?}
     */
    CdkDrag.prototype._initializeDragSequence = /**
     * Sets up the different variables and subscriptions
     * that will be necessary for the dragging sequence.
     * @param {?} referenceElement Element that started the drag sequence.
     * @param {?} event Browser event object that started the sequence.
     * @return {?}
     */
    function (referenceElement, event) {
        /** @type {?} */
        var isDragging = this._isDragging();
        // Abort if the user is already dragging or is using a mouse button other than the primary one.
        if (isDragging || (!this._isTouchEvent(event) && event.button !== 0)) {
            return;
        }
        this._hasStartedDragging = this._hasMoved = false;
        this._initialContainer = this.dropContainer;
        this._pointerMoveSubscription = this._dragDropRegistry.pointerMove.subscribe(this._pointerMove);
        this._pointerUpSubscription = this._dragDropRegistry.pointerUp.subscribe(this._pointerUp);
        this._scrollPosition = this._viewportRuler.getViewportScrollPosition();
        // If we have a custom preview template, the element won't be visible anyway so we avoid the
        // extra `getBoundingClientRect` calls and just move the preview next to the cursor.
        this._pickupPositionInElement = this._previewTemplate ? { x: 0, y: 0 } :
            this._getPointerPositionInElement(referenceElement, event);
        /** @type {?} */
        var pointerPosition = this._pickupPositionOnPage = this._getPointerPositionOnPage(event);
        this._pointerDirectionDelta = { x: 0, y: 0 };
        this._pointerPositionAtLastDirectionChange = { x: pointerPosition.x, y: pointerPosition.y };
        this._dragDropRegistry.startDragging(this, event);
    };
    /**
     * Starts the dragging sequence.
     * @return {?}
     */
    CdkDrag.prototype._startDragSequence = /**
     * Starts the dragging sequence.
     * @return {?}
     */
    function () {
        // Emit the event on the item before the one on the container.
        this.started.emit({ source: this });
        if (this.dropContainer) {
            /** @type {?} */
            var element = this._rootElement;
            // Grab the `nextSibling` before the preview and placeholder
            // have been created so we don't get the preview by accident.
            this._nextSibling = element.nextSibling;
            /** @type {?} */
            var preview = this._preview = this._createPreviewElement();
            /** @type {?} */
            var placeholder = this._placeholder = this._createPlaceholderElement();
            // We move the element out at the end of the body and we make it hidden, because keeping it in
            // place will throw off the consumer's `:last-child` selectors. We can't remove the element
            // from the DOM completely, because iOS will stop firing all subsequent events in the chain.
            element.style.display = 'none';
            this._document.body.appendChild(/** @type {?} */ ((element.parentNode)).replaceChild(placeholder, element));
            this._document.body.appendChild(preview);
            this.dropContainer.start();
        }
    };
    /**
     * Cleans up the DOM artifacts that were added to facilitate the element being dragged.
     * @return {?}
     */
    CdkDrag.prototype._cleanupDragArtifacts = /**
     * Cleans up the DOM artifacts that were added to facilitate the element being dragged.
     * @return {?}
     */
    function () {
        var _this = this;
        // Restore the element's visibility and insert it at its old position in the DOM.
        // It's important that we maintain the position, because moving the element around in the DOM
        // can throw off `NgFor` which does smart diffing and re-creates elements only when necessary,
        // while moving the existing elements in all other cases.
        this._rootElement.style.display = '';
        if (this._nextSibling) {
            /** @type {?} */ ((this._nextSibling.parentNode)).insertBefore(this._rootElement, this._nextSibling);
        }
        else {
            this._initialContainer.element.nativeElement.appendChild(this._rootElement);
        }
        this._destroyPreview();
        this._destroyPlaceholder();
        // Re-enter the NgZone since we bound `document` events on the outside.
        this._ngZone.run(function () {
            /** @type {?} */
            var currentIndex = _this.dropContainer.getItemIndex(_this);
            _this.ended.emit({ source: _this });
            _this.dropped.emit({
                item: _this,
                currentIndex: currentIndex,
                previousIndex: _this._initialContainer.getItemIndex(_this),
                container: _this.dropContainer,
                previousContainer: _this._initialContainer
            });
            _this.dropContainer.drop(_this, currentIndex, _this._initialContainer);
            _this.dropContainer = _this._initialContainer;
        });
    };
    /**
     * Updates the item's position in its drop container, or moves it
     * into a new one, depending on its current drag position.
     * @param {?} __0
     * @return {?}
     */
    CdkDrag.prototype._updateActiveDropContainer = /**
     * Updates the item's position in its drop container, or moves it
     * into a new one, depending on its current drag position.
     * @param {?} __0
     * @return {?}
     */
    function (_a) {
        var _this = this;
        var x = _a.x, y = _a.y;
        /** @type {?} */
        var newContainer = this.dropContainer._getSiblingContainerFromPosition(this, x, y);
        // If we couldn't find a new container to move the item into, and the item has left it's
        // initial container, check whether the it's allowed to return into its original container.
        // This handles the case where two containers are connected one way and the user tries to
        // undo dragging an item into a new container.
        if (!newContainer && this.dropContainer !== this._initialContainer &&
            this._initialContainer._canReturnItem(this, x, y)) {
            newContainer = this._initialContainer;
        }
        if (newContainer) {
            this._ngZone.run(function () {
                // Notify the old container that the item has left.
                _this.exited.emit({ item: _this, container: _this.dropContainer });
                _this.dropContainer.exit(_this);
                // Notify the new container that the item has entered.
                _this.entered.emit({ item: _this, container: /** @type {?} */ ((newContainer)) });
                _this.dropContainer = /** @type {?} */ ((newContainer));
                _this.dropContainer.enter(_this, x, y);
            });
        }
        this.dropContainer._sortItem(this, x, y, this._pointerDirectionDelta);
        this._setTransform(this._preview, x - this._pickupPositionInElement.x, y - this._pickupPositionInElement.y);
    };
    /**
     * Creates the element that will be rendered next to the user's pointer
     * and will be used as a preview of the element that is being dragged.
     * @return {?}
     */
    CdkDrag.prototype._createPreviewElement = /**
     * Creates the element that will be rendered next to the user's pointer
     * and will be used as a preview of the element that is being dragged.
     * @return {?}
     */
    function () {
        /** @type {?} */
        var preview;
        if (this._previewTemplate) {
            /** @type {?} */
            var viewRef = this._viewContainerRef.createEmbeddedView(this._previewTemplate.templateRef, this._previewTemplate.data);
            preview = viewRef.rootNodes[0];
            this._previewRef = viewRef;
            this._setTransform(preview, this._pickupPositionOnPage.x, this._pickupPositionOnPage.y);
        }
        else {
            /** @type {?} */
            var element = this._rootElement;
            /** @type {?} */
            var elementRect = element.getBoundingClientRect();
            preview = /** @type {?} */ (element.cloneNode(true));
            preview.style.width = elementRect.width + "px";
            preview.style.height = elementRect.height + "px";
            this._setTransform(preview, elementRect.left, elementRect.top);
        }
        extendStyles(preview.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '1000'
        });
        preview.classList.add('cdk-drag-preview');
        preview.setAttribute('dir', this._dir ? this._dir.value : 'ltr');
        return preview;
    };
    /**
     * Creates an element that will be shown instead of the current element while dragging.
     * @return {?}
     */
    CdkDrag.prototype._createPlaceholderElement = /**
     * Creates an element that will be shown instead of the current element while dragging.
     * @return {?}
     */
    function () {
        /** @type {?} */
        var placeholder;
        if (this._placeholderTemplate) {
            this._placeholderRef = this._viewContainerRef.createEmbeddedView(this._placeholderTemplate.templateRef, this._placeholderTemplate.data);
            placeholder = this._placeholderRef.rootNodes[0];
        }
        else {
            placeholder = /** @type {?} */ (this._rootElement.cloneNode(true));
        }
        placeholder.classList.add('cdk-drag-placeholder');
        return placeholder;
    };
    /**
     * Figures out the coordinates at which an element was picked up.
     * @param {?} referenceElement Element that initiated the dragging.
     * @param {?} event Event that initiated the dragging.
     * @return {?}
     */
    CdkDrag.prototype._getPointerPositionInElement = /**
     * Figures out the coordinates at which an element was picked up.
     * @param {?} referenceElement Element that initiated the dragging.
     * @param {?} event Event that initiated the dragging.
     * @return {?}
     */
    function (referenceElement, event) {
        /** @type {?} */
        var elementRect = this._rootElement.getBoundingClientRect();
        /** @type {?} */
        var handleElement = referenceElement === this._rootElement ? null : referenceElement;
        /** @type {?} */
        var referenceRect = handleElement ? handleElement.getBoundingClientRect() : elementRect;
        /** @type {?} */
        var point = this._isTouchEvent(event) ? event.targetTouches[0] : event;
        /** @type {?} */
        var x = point.pageX - referenceRect.left - this._scrollPosition.left;
        /** @type {?} */
        var y = point.pageY - referenceRect.top - this._scrollPosition.top;
        return {
            x: referenceRect.left - elementRect.left + x,
            y: referenceRect.top - elementRect.top + y
        };
    };
    /**
     * Animates the preview element from its current position to the location of the drop placeholder.
     * @return {?} Promise that resolves when the animation completes.
     */
    CdkDrag.prototype._animatePreviewToPlaceholder = /**
     * Animates the preview element from its current position to the location of the drop placeholder.
     * @return {?} Promise that resolves when the animation completes.
     */
    function () {
        var _this = this;
        // If the user hasn't moved yet, the transitionend event won't fire.
        if (!this._hasMoved) {
            return Promise.resolve();
        }
        /** @type {?} */
        var placeholderRect = this._placeholder.getBoundingClientRect();
        // Apply the class that adds a transition to the preview.
        this._preview.classList.add('cdk-drag-animating');
        // Move the preview to the placeholder position.
        this._setTransform(this._preview, placeholderRect.left, placeholderRect.top);
        /** @type {?} */
        var duration = getTransformTransitionDurationInMs(this._preview);
        if (duration === 0) {
            return Promise.resolve();
        }
        return this._ngZone.runOutsideAngular(function () {
            return new Promise(function (resolve) {
                /** @type {?} */
                var handler = /** @type {?} */ ((function (event) {
                    if (!event || (event.target === _this._preview && event.propertyName === 'transform')) {
                        _this._preview.removeEventListener('transitionend', handler);
                        resolve();
                        clearTimeout(timeout);
                    }
                }));
                /** @type {?} */
                var timeout = setTimeout(/** @type {?} */ (handler), duration * 1.5);
                _this._preview.addEventListener('transitionend', handler);
            });
        });
    };
    /**
     * Sets the `transform` style on an element.
     * @param {?} element Element on which to set the transform.
     * @param {?} x Desired position of the element along the X axis.
     * @param {?} y Desired position of the element along the Y axis.
     * @return {?}
     */
    CdkDrag.prototype._setTransform = /**
     * Sets the `transform` style on an element.
     * @param {?} element Element on which to set the transform.
     * @param {?} x Desired position of the element along the X axis.
     * @param {?} y Desired position of the element along the Y axis.
     * @return {?}
     */
    function (element, x, y) {
        element.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
    };
    /**
     * Helper to remove an element from the DOM and to do all the necessary null checks.
     * @param {?} element Element to be removed.
     * @return {?}
     */
    CdkDrag.prototype._removeElement = /**
     * Helper to remove an element from the DOM and to do all the necessary null checks.
     * @param {?} element Element to be removed.
     * @return {?}
     */
    function (element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    };
    /**
     * Determines the point of the page that was touched by the user.
     * @param {?} event
     * @return {?}
     */
    CdkDrag.prototype._getPointerPositionOnPage = /**
     * Determines the point of the page that was touched by the user.
     * @param {?} event
     * @return {?}
     */
    function (event) {
        /** @type {?} */
        var point = this._isTouchEvent(event) ? event.touches[0] : event;
        return {
            x: point.pageX - this._scrollPosition.left,
            y: point.pageY - this._scrollPosition.top
        };
    };
    /**
     * Gets the pointer position on the page, accounting for any position constraints.
     * @param {?} event
     * @return {?}
     */
    CdkDrag.prototype._getConstrainedPointerPosition = /**
     * Gets the pointer position on the page, accounting for any position constraints.
     * @param {?} event
     * @return {?}
     */
    function (event) {
        /** @type {?} */
        var point = this._getPointerPositionOnPage(event);
        /** @type {?} */
        var dropContainerLock = this.dropContainer ? this.dropContainer.lockAxis : null;
        if (this.lockAxis === 'x' || dropContainerLock === 'x') {
            point.y = this._pickupPositionOnPage.y;
        }
        else if (this.lockAxis === 'y' || dropContainerLock === 'y') {
            point.x = this._pickupPositionOnPage.x;
        }
        return point;
    };
    /**
     * Determines whether an event is a touch event.
     * @param {?} event
     * @return {?}
     */
    CdkDrag.prototype._isTouchEvent = /**
     * Determines whether an event is a touch event.
     * @param {?} event
     * @return {?}
     */
    function (event) {
        return event.type.startsWith('touch');
    };
    /**
     * Destroys the preview element and its ViewRef.
     * @return {?}
     */
    CdkDrag.prototype._destroyPreview = /**
     * Destroys the preview element and its ViewRef.
     * @return {?}
     */
    function () {
        if (this._preview) {
            this._removeElement(this._preview);
        }
        if (this._previewRef) {
            this._previewRef.destroy();
        }
        this._preview = this._previewRef = /** @type {?} */ ((null));
    };
    /**
     * Destroys the placeholder element and its ViewRef.
     * @return {?}
     */
    CdkDrag.prototype._destroyPlaceholder = /**
     * Destroys the placeholder element and its ViewRef.
     * @return {?}
     */
    function () {
        if (this._placeholder) {
            this._removeElement(this._placeholder);
        }
        if (this._placeholderRef) {
            this._placeholderRef.destroy();
        }
        this._placeholder = this._placeholderRef = /** @type {?} */ ((null));
    };
    /**
     * Updates the current drag delta, based on the user's current pointer position on the page.
     * @param {?} pointerPositionOnPage
     * @return {?}
     */
    CdkDrag.prototype._updatePointerDirectionDelta = /**
     * Updates the current drag delta, based on the user's current pointer position on the page.
     * @param {?} pointerPositionOnPage
     * @return {?}
     */
    function (pointerPositionOnPage) {
        var x = pointerPositionOnPage.x, y = pointerPositionOnPage.y;
        /** @type {?} */
        var delta = this._pointerDirectionDelta;
        /** @type {?} */
        var positionSinceLastChange = this._pointerPositionAtLastDirectionChange;
        /** @type {?} */
        var changeX = Math.abs(x - positionSinceLastChange.x);
        /** @type {?} */
        var changeY = Math.abs(y - positionSinceLastChange.y);
        // Because we handle pointer events on a per-pixel basis, we don't want the delta
        // to change for every pixel, otherwise anything that depends on it can look erratic.
        // To make the delta more consistent, we track how much the user has moved since the last
        // delta change and we only update it after it has reached a certain threshold.
        if (changeX > this._config.pointerDirectionChangeThreshold) {
            delta.x = x > positionSinceLastChange.x ? 1 : -1;
            positionSinceLastChange.x = x;
        }
        if (changeY > this._config.pointerDirectionChangeThreshold) {
            delta.y = y > positionSinceLastChange.y ? 1 : -1;
            positionSinceLastChange.y = y;
        }
        return delta;
    };
    /**
     * Gets the root draggable element, based on the `rootElementSelector`.
     * @return {?}
     */
    CdkDrag.prototype._getRootElement = /**
     * Gets the root draggable element, based on the `rootElementSelector`.
     * @return {?}
     */
    function () {
        if (this.rootElementSelector) {
            /** @type {?} */
            var selector = this.rootElementSelector;
            /** @type {?} */
            var currentElement = /** @type {?} */ (this.element.nativeElement.parentElement);
            while (currentElement) {
                // IE doesn't support `matches` so we have to fall back to `msMatchesSelector`.
                if (currentElement.matches ? currentElement.matches(selector) :
                    (/** @type {?} */ (currentElement)).msMatchesSelector(selector)) {
                    return currentElement;
                }
                currentElement = currentElement.parentElement;
            }
        }
        return this.element.nativeElement;
    };
    /**
     * Unsubscribes from the global subscriptions.
     * @return {?}
     */
    CdkDrag.prototype._removeSubscriptions = /**
     * Unsubscribes from the global subscriptions.
     * @return {?}
     */
    function () {
        this._pointerMoveSubscription.unsubscribe();
        this._pointerUpSubscription.unsubscribe();
    };
    CdkDrag.decorators = [
        { type: core.Directive, args: [{
                    selector: '[cdkDrag]',
                    exportAs: 'cdkDrag',
                    host: {
                        'class': 'cdk-drag',
                        '[class.cdk-drag-dragging]': '_hasStartedDragging && _isDragging()',
                    }
                },] },
    ];
    /** @nocollapse */
    CdkDrag.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [CDK_DROP_CONTAINER,] }, { type: core.Optional }, { type: core.SkipSelf }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: core.NgZone },
        { type: core.ViewContainerRef },
        { type: scrolling.ViewportRuler },
        { type: DragDropRegistry },
        { type: undefined, decorators: [{ type: core.Inject, args: [CDK_DRAG_CONFIG,] }] },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] }
    ]; };
    CdkDrag.propDecorators = {
        _handles: [{ type: core.ContentChildren, args: [CdkDragHandle,] }],
        _previewTemplate: [{ type: core.ContentChild, args: [CdkDragPreview,] }],
        _placeholderTemplate: [{ type: core.ContentChild, args: [CdkDragPlaceholder,] }],
        data: [{ type: core.Input, args: ['cdkDragData',] }],
        lockAxis: [{ type: core.Input, args: ['cdkDragLockAxis',] }],
        rootElementSelector: [{ type: core.Input, args: ['cdkDragRootElement',] }],
        started: [{ type: core.Output, args: ['cdkDragStarted',] }],
        ended: [{ type: core.Output, args: ['cdkDragEnded',] }],
        entered: [{ type: core.Output, args: ['cdkDragEntered',] }],
        exited: [{ type: core.Output, args: ['cdkDragExited',] }],
        dropped: [{ type: core.Output, args: ['cdkDragDropped',] }],
        moved: [{ type: core.Output, args: ['cdkDragMoved',] }]
    };
    return CdkDrag;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * Moves an item one index in an array to another.
 * @template T
 * @param {?} array Array in which to move the item.
 * @param {?} fromIndex Starting index of the item.
 * @param {?} toIndex Index to which the item should be moved.
 * @return {?}
 */
function moveItemInArray(array, fromIndex, toIndex) {
    /** @type {?} */
    var from = clamp(fromIndex, array.length - 1);
    /** @type {?} */
    var to = clamp(toIndex, array.length - 1);
    if (from === to) {
        return;
    }
    /** @type {?} */
    var target = array[from];
    /** @type {?} */
    var delta = to < from ? -1 : 1;
    for (var i = from; i !== to; i += delta) {
        array[i] = array[i + delta];
    }
    array[to] = target;
}
/**
 * Moves an item from one array to another.
 * @template T
 * @param {?} currentArray Array from which to transfer the item.
 * @param {?} targetArray Array into which to put the item.
 * @param {?} currentIndex Index of the item in its current array.
 * @param {?} targetIndex Index at which to insert the item.
 * @return {?}
 */
function transferArrayItem(currentArray, targetArray, currentIndex, targetIndex) {
    /** @type {?} */
    var from = clamp(currentIndex, currentArray.length - 1);
    /** @type {?} */
    var to = clamp(targetIndex, targetArray.length);
    if (currentArray.length) {
        targetArray.splice(to, 0, currentArray.splice(from, 1)[0]);
    }
}
/**
 * Clamps a number between zero and a maximum.
 * @param {?} value
 * @param {?} max
 * @return {?}
 */
function clamp(value, max) {
    return Math.max(0, Math.min(max, value));
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 * Counter used to generate unique ids for drop zones.
  @type {?} */
var _uniqueIdCounter = 0;
/** *
 * Proximity, as a ratio to width/height, at which a
 * dragged item will affect the drop container.
  @type {?} */
var DROP_PROXIMITY_THRESHOLD = 0.05;
/**
 * Container that wraps a set of draggable items.
 * @template T
 */
var CdkDrop = /** @class */ (function () {
    function CdkDrop(element, _dragDropRegistry, _dir) {
        this.element = element;
        this._dragDropRegistry = _dragDropRegistry;
        this._dir = _dir;
        /**
         * Other draggable containers that this container is connected to and into which the
         * container's items can be transferred. Can either be references to other drop containers,
         * or their unique IDs.
         */
        this.connectedTo = [];
        /**
         * Direction in which the list is oriented.
         */
        this.orientation = 'vertical';
        /**
         * Unique ID for the drop zone. Can be used as a reference
         * in the `connectedTo` of another `CdkDrop`.
         */
        this.id = "cdk-drop-" + _uniqueIdCounter++;
        /**
         * Function that is used to determine whether an item
         * is allowed to be moved into a drop container.
         */
        this.enterPredicate = function () { return true; };
        /**
         * Emits when the user drops an item inside the container.
         */
        this.dropped = new core.EventEmitter();
        /**
         * Emits when the user has moved a new drag item into this container.
         */
        this.entered = new core.EventEmitter();
        /**
         * Emits when the user removes an item from the container
         * by dragging it into another container.
         */
        this.exited = new core.EventEmitter();
        /**
         * Whether an item in the container is being dragged.
         */
        this._dragging = false;
        /**
         * Cache of the dimensions of all the items and the sibling containers.
         */
        this._positionCache = {
            items: /** @type {?} */ ([]),
            siblings: /** @type {?} */ ([]),
            self: /** @type {?} */ ({})
        };
        /**
         * Keeps track of the item that was last swapped with the dragged item, as
         * well as what direction the pointer was moving in when the swap occured.
         */
        this._previousSwap = { drag: /** @type {?} */ (null), delta: 0 };
    }
    /**
     * @return {?}
     */
    CdkDrop.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        this._dragDropRegistry.registerDropContainer(this);
    };
    /**
     * @return {?}
     */
    CdkDrop.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._dragDropRegistry.removeDropContainer(this);
    };
    /** Starts dragging an item. */
    /**
     * Starts dragging an item.
     * @return {?}
     */
    CdkDrop.prototype.start = /**
     * Starts dragging an item.
     * @return {?}
     */
    function () {
        this._dragging = true;
        this._activeDraggables = this._draggables.toArray();
        this._cachePositions();
    };
    /**
     * Drops an item into this container.
     * @param item Item being dropped into the container.
     * @param currentIndex Index at which the item should be inserted.
     * @param previousContainer Container from which the item got dragged in.
     */
    /**
     * Drops an item into this container.
     * @param {?} item Item being dropped into the container.
     * @param {?} currentIndex Index at which the item should be inserted.
     * @param {?} previousContainer Container from which the item got dragged in.
     * @return {?}
     */
    CdkDrop.prototype.drop = /**
     * Drops an item into this container.
     * @param {?} item Item being dropped into the container.
     * @param {?} currentIndex Index at which the item should be inserted.
     * @param {?} previousContainer Container from which the item got dragged in.
     * @return {?}
     */
    function (item, currentIndex, previousContainer) {
        this._reset();
        this.dropped.emit({
            item: item,
            currentIndex: currentIndex,
            previousIndex: previousContainer.getItemIndex(item),
            container: this,
            // TODO(crisbeto): reconsider whether to make this null if the containers are the same.
            previousContainer: previousContainer
        });
    };
    /**
     * Emits an event to indicate that the user moved an item into the container.
     * @param item Item that was moved into the container.
     * @param pointerX Position of the item along the X axis.
     * @param pointerY Position of the item along the Y axis.
     */
    /**
     * Emits an event to indicate that the user moved an item into the container.
     * @param {?} item Item that was moved into the container.
     * @param {?} pointerX Position of the item along the X axis.
     * @param {?} pointerY Position of the item along the Y axis.
     * @return {?}
     */
    CdkDrop.prototype.enter = /**
     * Emits an event to indicate that the user moved an item into the container.
     * @param {?} item Item that was moved into the container.
     * @param {?} pointerX Position of the item along the X axis.
     * @param {?} pointerY Position of the item along the Y axis.
     * @return {?}
     */
    function (item, pointerX, pointerY) {
        this.entered.emit({ item: item, container: this });
        this.start();
        /** @type {?} */
        var newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY);
        /** @type {?} */
        var currentIndex = this._activeDraggables.indexOf(item);
        /** @type {?} */
        var newPositionReference = this._activeDraggables[newIndex];
        /** @type {?} */
        var placeholder = item.getPlaceholderElement();
        // Since the item may be in the `activeDraggables` already (e.g. if the user dragged it
        // into another container and back again), we have to ensure that it isn't duplicated.
        if (currentIndex > -1) {
            this._activeDraggables.splice(currentIndex, 1);
        }
        // Don't use items that are being dragged as a reference, because
        // their element has been moved down to the bottom of the body.
        if (newPositionReference && !this._dragDropRegistry.isDragging(newPositionReference)) {
            /** @type {?} */
            var element = newPositionReference.getRootElement(); /** @type {?} */
            ((element.parentElement)).insertBefore(placeholder, element);
            this._activeDraggables.splice(newIndex, 0, item);
        }
        else {
            this.element.nativeElement.appendChild(placeholder);
            this._activeDraggables.push(item);
        }
        // The transform needs to be cleared so it doesn't throw off the measurements.
        placeholder.style.transform = '';
        // Note that the positions were already cached when we called `start` above,
        // but we need to refresh them since the amount of items has changed.
        this._cachePositions();
    };
    /**
     * Removes an item from the container after it was dragged into another container by the user.
     * @param item Item that was dragged out.
     */
    /**
     * Removes an item from the container after it was dragged into another container by the user.
     * @param {?} item Item that was dragged out.
     * @return {?}
     */
    CdkDrop.prototype.exit = /**
     * Removes an item from the container after it was dragged into another container by the user.
     * @param {?} item Item that was dragged out.
     * @return {?}
     */
    function (item) {
        this._reset();
        this.exited.emit({ item: item, container: this });
    };
    /**
     * Figures out the index of an item in the container.
     * @param item Item whose index should be determined.
     */
    /**
     * Figures out the index of an item in the container.
     * @param {?} item Item whose index should be determined.
     * @return {?}
     */
    CdkDrop.prototype.getItemIndex = /**
     * Figures out the index of an item in the container.
     * @param {?} item Item whose index should be determined.
     * @return {?}
     */
    function (item) {
        if (!this._dragging) {
            return this._draggables.toArray().indexOf(item);
        }
        /** @type {?} */
        var items = this.orientation === 'horizontal' && this._dir && this._dir.value === 'rtl' ?
            this._positionCache.items.slice().reverse() : this._positionCache.items;
        return findIndex(items, function (currentItem) { return currentItem.drag === item; });
    };
    /**
     * Sorts an item inside the container based on its position.
     * @param item Item to be sorted.
     * @param pointerX Position of the item along the X axis.
     * @param pointerY Position of the item along the Y axis.
     * @param pointerDeta Direction in which the pointer is moving along each axis.
     */
    /**
     * Sorts an item inside the container based on its position.
     * @param {?} item Item to be sorted.
     * @param {?} pointerX Position of the item along the X axis.
     * @param {?} pointerY Position of the item along the Y axis.
     * @param {?} pointerDelta
     * @return {?}
     */
    CdkDrop.prototype._sortItem = /**
     * Sorts an item inside the container based on its position.
     * @param {?} item Item to be sorted.
     * @param {?} pointerX Position of the item along the X axis.
     * @param {?} pointerY Position of the item along the Y axis.
     * @param {?} pointerDelta
     * @return {?}
     */
    function (item, pointerX, pointerY, pointerDelta) {
        var _this = this;
        // Don't sort the item if it's out of range.
        if (!this._isPointerNearDropContainer(pointerX, pointerY)) {
            return;
        }
        /** @type {?} */
        var siblings = this._positionCache.items;
        /** @type {?} */
        var newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY, pointerDelta);
        if (newIndex === -1 && siblings.length > 0) {
            return;
        }
        /** @type {?} */
        var isHorizontal = this.orientation === 'horizontal';
        /** @type {?} */
        var currentIndex = findIndex(siblings, function (currentItem) { return currentItem.drag === item; });
        /** @type {?} */
        var siblingAtNewPosition = siblings[newIndex];
        /** @type {?} */
        var currentPosition = siblings[currentIndex].clientRect;
        /** @type {?} */
        var newPosition = siblingAtNewPosition.clientRect;
        /** @type {?} */
        var delta = currentIndex > newIndex ? 1 : -1;
        this._previousSwap.drag = siblingAtNewPosition.drag;
        this._previousSwap.delta = isHorizontal ? pointerDelta.x : pointerDelta.y;
        /** @type {?} */
        var itemOffset = isHorizontal ? newPosition.left - currentPosition.left :
            newPosition.top - currentPosition.top;
        /** @type {?} */
        var siblingOffset = isHorizontal ? currentPosition.width * delta :
            currentPosition.height * delta;
        /** @type {?} */
        var oldOrder = siblings.slice();
        // Shuffle the array in place.
        moveItemInArray(siblings, currentIndex, newIndex);
        siblings.forEach(function (sibling, index) {
            // Don't do anything if the position hasn't changed.
            if (oldOrder[index] === sibling) {
                return;
            }
            /** @type {?} */
            var isDraggedItem = sibling.drag === item;
            /** @type {?} */
            var offset = isDraggedItem ? itemOffset : siblingOffset;
            /** @type {?} */
            var elementToOffset = isDraggedItem ? item.getPlaceholderElement() :
                sibling.drag.getRootElement();
            // Update the offset to reflect the new position.
            sibling.offset += offset;
            // Since we're moving the items with a `transform`, we need to adjust their cached
            // client rects to reflect their new position, as well as swap their positions in the cache.
            // Note that we shouldn't use `getBoundingClientRect` here to update the cache, because the
            // elements may be mid-animation which will give us a wrong result.
            if (isHorizontal) {
                elementToOffset.style.transform = "translate3d(" + sibling.offset + "px, 0, 0)";
                _this._adjustClientRect(sibling.clientRect, 0, offset);
            }
            else {
                elementToOffset.style.transform = "translate3d(0, " + sibling.offset + "px, 0)";
                _this._adjustClientRect(sibling.clientRect, offset, 0);
            }
        });
    };
    /**
     * Figures out whether an item should be moved into a sibling
     * drop container, based on its current position.
     * @param item Drag item that is being moved.
     * @param x Position of the item along the X axis.
     * @param y Position of the item along the Y axis.
     */
    /**
     * Figures out whether an item should be moved into a sibling
     * drop container, based on its current position.
     * @param {?} item Drag item that is being moved.
     * @param {?} x Position of the item along the X axis.
     * @param {?} y Position of the item along the Y axis.
     * @return {?}
     */
    CdkDrop.prototype._getSiblingContainerFromPosition = /**
     * Figures out whether an item should be moved into a sibling
     * drop container, based on its current position.
     * @param {?} item Drag item that is being moved.
     * @param {?} x Position of the item along the X axis.
     * @param {?} y Position of the item along the Y axis.
     * @return {?}
     */
    function (item, x, y) {
        /** @type {?} */
        var result = this._positionCache.siblings
            .find(function (sibling) { return isInsideClientRect(sibling.clientRect, x, y); });
        return result && result.drop.enterPredicate(item, this) ? result.drop : null;
    };
    /**
     * Checks whether an item that started in this container can be returned to it,
     * after it was moved out into another container.
     * @param item Item that is being checked.
     * @param x Position of the item along the X axis.
     * @param y Position of the item along the Y axis.
     */
    /**
     * Checks whether an item that started in this container can be returned to it,
     * after it was moved out into another container.
     * @param {?} item Item that is being checked.
     * @param {?} x Position of the item along the X axis.
     * @param {?} y Position of the item along the Y axis.
     * @return {?}
     */
    CdkDrop.prototype._canReturnItem = /**
     * Checks whether an item that started in this container can be returned to it,
     * after it was moved out into another container.
     * @param {?} item Item that is being checked.
     * @param {?} x Position of the item along the X axis.
     * @param {?} y Position of the item along the Y axis.
     * @return {?}
     */
    function (item, x, y) {
        return isInsideClientRect(this._positionCache.self, x, y) && this.enterPredicate(item, this);
    };
    /**
     * Refreshes the position cache of the items and sibling containers.
     * @return {?}
     */
    CdkDrop.prototype._cachePositions = /**
     * Refreshes the position cache of the items and sibling containers.
     * @return {?}
     */
    function () {
        var _this = this;
        /** @type {?} */
        var isHorizontal = this.orientation === 'horizontal';
        this._positionCache.items = this._activeDraggables
            .map(function (drag) {
            /** @type {?} */
            var elementToMeasure = _this._dragDropRegistry.isDragging(drag) ?
                // If the element is being dragged, we have to measure the
                // placeholder, because the element is hidden.
                drag.getPlaceholderElement() :
                drag.getRootElement();
            /** @type {?} */
            var clientRect = elementToMeasure.getBoundingClientRect();
            return {
                drag: drag,
                offset: 0,
                // We need to clone the `clientRect` here, because all the values on it are readonly
                // and we need to be able to update them. Also we can't use a spread here, because
                // the values on a `ClientRect` aren't own properties. See:
                // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect#Notes
                clientRect: {
                    top: clientRect.top,
                    right: clientRect.right,
                    bottom: clientRect.bottom,
                    left: clientRect.left,
                    width: clientRect.width,
                    height: clientRect.height
                }
            };
        })
            .sort(function (a, b) {
            return isHorizontal ? a.clientRect.left - b.clientRect.left :
                a.clientRect.top - b.clientRect.top;
        });
        this._positionCache.siblings = coercion.coerceArray(this.connectedTo)
            .map(function (drop) { return typeof drop === 'string' ? /** @type {?} */ ((_this._dragDropRegistry.getDropContainer(drop))) : drop; })
            .filter(function (drop) { return drop && drop !== _this; })
            .map(function (drop) { return ({ drop: drop, clientRect: drop.element.nativeElement.getBoundingClientRect() }); });
        this._positionCache.self = this.element.nativeElement.getBoundingClientRect();
    };
    /**
     * Resets the container to its initial state.
     * @return {?}
     */
    CdkDrop.prototype._reset = /**
     * Resets the container to its initial state.
     * @return {?}
     */
    function () {
        this._dragging = false;
        // TODO(crisbeto): may have to wait for the animations to finish.
        this._activeDraggables.forEach(function (item) { return item.getRootElement().style.transform = ''; });
        this._activeDraggables = [];
        this._positionCache.items = [];
        this._positionCache.siblings = [];
        this._previousSwap.drag = null;
        this._previousSwap.delta = 0;
    };
    /**
     * Updates the top/left positions of a `ClientRect`, as well as their bottom/right counterparts.
     * @param {?} clientRect `ClientRect` that should be updated.
     * @param {?} top Amount to add to the `top` position.
     * @param {?} left Amount to add to the `left` position.
     * @return {?}
     */
    CdkDrop.prototype._adjustClientRect = /**
     * Updates the top/left positions of a `ClientRect`, as well as their bottom/right counterparts.
     * @param {?} clientRect `ClientRect` that should be updated.
     * @param {?} top Amount to add to the `top` position.
     * @param {?} left Amount to add to the `left` position.
     * @return {?}
     */
    function (clientRect, top, left) {
        clientRect.top += top;
        clientRect.bottom = clientRect.top + clientRect.height;
        clientRect.left += left;
        clientRect.right = clientRect.left + clientRect.width;
    };
    /**
     * Gets the index of an item in the drop container, based on the position of the user's pointer.
     * @param {?} item Item that is being sorted.
     * @param {?} pointerX Position of the user's pointer along the X axis.
     * @param {?} pointerY Position of the user's pointer along the Y axis.
     * @param {?=} delta Direction in which the user is moving their pointer.
     * @return {?}
     */
    CdkDrop.prototype._getItemIndexFromPointerPosition = /**
     * Gets the index of an item in the drop container, based on the position of the user's pointer.
     * @param {?} item Item that is being sorted.
     * @param {?} pointerX Position of the user's pointer along the X axis.
     * @param {?} pointerY Position of the user's pointer along the Y axis.
     * @param {?=} delta Direction in which the user is moving their pointer.
     * @return {?}
     */
    function (item, pointerX, pointerY, delta) {
        var _this = this;
        /** @type {?} */
        var isHorizontal = this.orientation === 'horizontal';
        return findIndex(this._positionCache.items, function (_a, _, array) {
            var drag = _a.drag, clientRect = _a.clientRect;
            if (drag === item) {
                // If there's only one item left in the container, it must be
                // the dragged item itself so we use it as a reference.
                return array.length < 2;
            }
            if (delta) {
                /** @type {?} */
                var direction = isHorizontal ? delta.x : delta.y;
                // If the user is still hovering over the same item as last time, and they didn't change
                // the direction in which they're dragging, we don't consider it a direction swap.
                if (drag === _this._previousSwap.drag && direction === _this._previousSwap.delta) {
                    return false;
                }
            }
            return isHorizontal ?
                // Round these down since most browsers report client rects with
                // sub-pixel precision, whereas the pointer coordinates are rounded to pixels.
                pointerX >= Math.floor(clientRect.left) && pointerX <= Math.floor(clientRect.right) :
                pointerY >= Math.floor(clientRect.top) && pointerY <= Math.floor(clientRect.bottom);
        });
    };
    /**
     * Checks whether the pointer coordinates are close to the drop container.
     * @param {?} pointerX Coordinates along the X axis.
     * @param {?} pointerY Coordinates along the Y axis.
     * @return {?}
     */
    CdkDrop.prototype._isPointerNearDropContainer = /**
     * Checks whether the pointer coordinates are close to the drop container.
     * @param {?} pointerX Coordinates along the X axis.
     * @param {?} pointerY Coordinates along the Y axis.
     * @return {?}
     */
    function (pointerX, pointerY) {
        var _a = this._positionCache.self, top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left, width = _a.width, height = _a.height;
        /** @type {?} */
        var xThreshold = width * DROP_PROXIMITY_THRESHOLD;
        /** @type {?} */
        var yThreshold = height * DROP_PROXIMITY_THRESHOLD;
        return pointerY > top - yThreshold && pointerY < bottom + yThreshold &&
            pointerX > left - xThreshold && pointerX < right + xThreshold;
    };
    CdkDrop.decorators = [
        { type: core.Directive, args: [{
                    selector: '[cdkDrop], cdk-drop',
                    exportAs: 'cdkDrop',
                    providers: [
                        { provide: CDK_DROP_CONTAINER, useExisting: CdkDrop },
                    ],
                    host: {
                        'class': 'cdk-drop',
                        '[id]': 'id',
                        '[class.cdk-drop-dragging]': '_dragging'
                    }
                },] },
    ];
    /** @nocollapse */
    CdkDrop.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: DragDropRegistry },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] }
    ]; };
    CdkDrop.propDecorators = {
        _draggables: [{ type: core.ContentChildren, args: [core.forwardRef(function () { return CdkDrag; }),] }],
        connectedTo: [{ type: core.Input, args: ['cdkDropConnectedTo',] }],
        data: [{ type: core.Input, args: ['cdkDropData',] }],
        orientation: [{ type: core.Input, args: ['cdkDropOrientation',] }],
        id: [{ type: core.Input }],
        lockAxis: [{ type: core.Input, args: ['cdkDropLockAxis',] }],
        enterPredicate: [{ type: core.Input, args: ['cdkDropEnterPredicate',] }],
        dropped: [{ type: core.Output, args: ['cdkDropDropped',] }],
        entered: [{ type: core.Output, args: ['cdkDropEntered',] }],
        exited: [{ type: core.Output, args: ['cdkDropExited',] }]
    };
    return CdkDrop;
}());
/**
 * Finds the index of an item that matches a predicate function. Used as an equivalent
 * of `Array.prototype.find` which isn't part of the standard Google typings.
 * @template T
 * @param {?} array Array in which to look for matches.
 * @param {?} predicate Function used to determine whether an item is a match.
 * @return {?}
 */
function findIndex(array, predicate) {
    for (var i = 0; i < array.length; i++) {
        if (predicate(array[i], i, array)) {
            return i;
        }
    }
    return -1;
}
/**
 * Checks whether some coordinates are within a `ClientRect`.
 * @param {?} clientRect ClientRect that is being checked.
 * @param {?} x Coordinates along the X axis.
 * @param {?} y Coordinates along the Y axis.
 * @return {?}
 */
function isInsideClientRect(clientRect, x, y) {
    var top = clientRect.top, bottom = clientRect.bottom, left = clientRect.left, right = clientRect.right;
    return y >= top && y <= bottom && x >= left && x <= right;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var DragDropModule = /** @class */ (function () {
    function DragDropModule() {
    }
    DragDropModule.decorators = [
        { type: core.NgModule, args: [{
                    declarations: [
                        CdkDrop,
                        CdkDrag,
                        CdkDragHandle,
                        CdkDragPreview,
                        CdkDragPlaceholder,
                    ],
                    exports: [
                        CdkDrop,
                        CdkDrag,
                        CdkDragHandle,
                        CdkDragPreview,
                        CdkDragPlaceholder,
                    ],
                },] },
    ];
    return DragDropModule;
}());

exports.CdkDrop = CdkDrop;
exports.CDK_DROP_CONTAINER = CDK_DROP_CONTAINER;
exports.CDK_DRAG_CONFIG_FACTORY = CDK_DRAG_CONFIG_FACTORY;
exports.CDK_DRAG_CONFIG = CDK_DRAG_CONFIG;
exports.CdkDrag = CdkDrag;
exports.CdkDragHandle = CdkDragHandle;
exports.moveItemInArray = moveItemInArray;
exports.transferArrayItem = transferArrayItem;
exports.CdkDragPreview = CdkDragPreview;
exports.CdkDragPlaceholder = CdkDragPlaceholder;
exports.DragDropModule = DragDropModule;
exports.DragDropRegistry = DragDropRegistry;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cdk-drag-drop.umd.js.map
