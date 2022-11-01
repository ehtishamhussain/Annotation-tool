import {fabric} from 'fabric';

const HANDLE_RADIUS = 10;
const MIN_THICKNESS = 2;
const MAX_THICKNESS = 250;
const RAD_360 = Math.PI * 2;
const numberPrecision = 8;
const keyboardShift = 16;
const RAD_90 = Math.PI / 2;
const RAD_180 = Math.PI;
const RAD_270 = Math.PI * (3 / 2);
const pointProperties = 'x1 y1 x2 y2 bx by'.split(' ');


const getTriangleSizeByThickness = arrowSize => arrowSize;

const toFixed = fabric.util.toFixed;

const extrapolatePoints = (p1, p2, ratio) =>
    new fabric.Point(p1.x + (p2.x - p1.x) * ratio, p1.y + (p2.y - p1.y) * ratio);

const getSnapAngleForAngle = angle => {
    const snapAngleStep = 15;
    const minAngle = Math.floor(angle / snapAngleStep) * snapAngleStep;
    const maxAngle = Math.ceil(angle / snapAngleStep) * snapAngleStep;
    if (Math.abs(angle - minAngle) < Math.abs(angle - maxAngle)) {
        return minAngle;
    }
    return maxAngle;
};

const canvasEventProxy = (listener, _this) => o => {
    if (_this.canvas) {
        listener.call(_this, o);
    }
};

fabric.LineAnnotateArrow = new fabric.util.createClass(fabric.Object, {
    type: 'LineAnnotateArrow',
    title: "Annotation",
    arrowSize: 20,
    arrow1: true,
    arrow2: false,
    strokeWidth: 10,
    originX: 'center',
    originY: 'center',
    hasBorders: true,
    objectCaching: false,
    noScaleCache: true,
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: false,
    bx: 0,
    by: 0,
    controlX: 0,
    controlY: 0,
    controlPointAngleFromOrigin:0,
    distanceOfControlFromOrigin:0,
    localPassingPoint: new fabric.Point(0,0),
    length: 0,
    // padding: 5,
    perPixelTargetFind: false,
    // cacheProperties,
    // stateProperties,
    scaleX: 1,
    scaleY: 1,
    p1: {x: -50, y: 0},
    p2: {x: 50, y: 0},
    cp: {
        x: 0,
        y: 0
    },
    canvas: null,
    fill: null,
    initialize: function (options) {
        this.canvas = options.canvas
        // if no strokeWidth, rendering issue can occur
        const optionsFixed = {
            ...options,
            originX: 'center',
            originY: 'center',
            custom: {...options.custom, type: 'line'},
        };

        if (options[1]) {
            // object to migrate
            const p1 = new fabric.Point(options[0], options[1]);
            const p2 = {x: options[2], y: options[3]};
            const midPoint = {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};

            const width = p1.distanceFrom(p2);
            const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
            optionsFixed.left = midPoint.x;
            optionsFixed.top = midPoint.y;
            optionsFixed.width = width;
            optionsFixed.height = 5;
            optionsFixed.angle = angle;
        }
        if (options.thickness) {
            // migrate data
            optionsFixed.arrowSize = options.thickness ** (8 / 10) * 10 - 6;
            optionsFixed.stroke = options.fill;
            optionsFixed.strokeWidth = options.thickness;

            delete optionsFixed.thickness;
        }

        this.callSuper('initialize', optionsFixed);
        // Set all controls hidden here and keep 'hasControls' to true, so we can hook into
        // Fabric internal controls drawing system.
        this.setControlsVisibility({
            tl: false,
            tr: false,
            br: false,
            bl: false,
            ml: false,
            mt: false,
            mr: false,
            mb: false,
            mtr: false,
        });

        this.lockSkewingX = true;
        this.lockSkewingY = true;
        this.skewX = 0;
        this.skewY = 0;


        //this.curve = new L(n.x,n.y,this.cp.x,this.cp.y,r.x,r.y)
        this.canvasSelectionClearedHandler = canvasEventProxy(
            this.onCanvasSelectionCleared,
            this,
        );
        this.canvasMouseDownHandler = canvasEventProxy(
            this.onCanvasMouseDown,
            this,
        );
        this.canvasMouseUpHandler = canvasEventProxy(this.onCanvasMouseUp, this);
        this.canvasMouseMoveHandler = canvasEventProxy(
            this.onCanvasMouseMove,
            this,
        );
        this.shiftKeyActive = false;
        this.initialized = true;
    },

    getLocalP1: function () {
        return new fabric.Point(-this.width / 2, 0);
    },

    getLocalP2: function () {
        return new fabric.Point(this.width / 2, 0);
    },
    // _set: function (key, value) {
    //     if (!this.initialized) {
    //         this.callSuper('_set', key, value);
    //         return this;
    //     }
    //     const newValue = value;
    //     const previousArrow1 = this.arrow1;
    //     const previousArrow2 = this.arrow2;
    //
    //     if (key === 'thickness') {
    //         this.strokeWidth = Math.min(this.strokeWidth, newValue * 4);
    //         this.canvas?.requestRenderAll();
    //     }
    //
    //     if (key === 'fill') {
    //         this.stroke = newValue;
    //         this.canvas?.requestRenderAll();
    //     }
    //
    //     if (key === 'strokeWidth') {
    //         this.strokeWidth = newValue;
    //         return this;
    //     }
    //
    //     if (key === 'stroke') {
    //         // this.thickness = Math.max(this.thickness, newValue / 4);
    //         this.stroke = newValue;
    //         return this;
    //     }
    //     this.callSuper('_set', key, newValue);
    //
    //     if (pointProperties.includes(key)) {
    //         const points = [this.x1, this.y1, this.x2, this.y2];
    //         const {p1, p2} = this.getPointsFromCoordsArray(points);
    //         let newP1 = p1;
    //         let newP2 = p2;
    //         // Make sure line is not too short
    //         const minLength = this.getMinLengthFromArrowSize(this.thickness);
    //         const newLength = p1.distanceFrom(p2);
    //         if (newLength < minLength) {
    //             const pointChanged = parseInt(key.substr(1, 1), 10);
    //             if (pointChanged === 1) {
    //                 newP1 = extrapolatePoints(p2, p1, minLength / newLength);
    //                 newP2 = p2;
    //             } else {
    //                 newP1 = p1;
    //                 newP2 = extrapolatePoints(p1, p2, minLength / newLength);
    //             }
    //         }
    //         this.updateWithPoints(newP1, newP2);
    //     }
    //
    //     if (key === 'length') {
    //         // Flip line if length is negative
    //         let points = [this.x1, this.y1, this.x2, this.y2];
    //         if (newValue < 0) {
    //             points = [this.x2, this.y2, this.x1, this.y1];
    //         }
    //         const {p1, p2} = this.getPointsFromCoordsArray(points);
    //         const newLength = Math.abs(newValue);
    //         const minLength = this.getMinLengthFromArrowSize(this.strokeWidth);
    //         const currentLength = p1.distanceFrom(p2);
    //         // Make sure line is not too short
    //         const newP2 = extrapolatePoints(
    //             p1,
    //             p2,
    //             Math.max(newLength, minLength) / currentLength,
    //         );
    //         this.updateWithPoints(p1, newP2);
    //     }
    //
    //     if (key === 'top' || key === 'left') {
    //         this.updateP1Coords(this.getGlobalPoint(this.getLocalP1()));
    //         this.updateP2Coords(this.getGlobalPoint(this.getLocalP2()));
    //     }
    //
    //     if (key === 'arrow1' && !previousArrow1 && newValue === true) {
    //         const points = [this.x1, this.y1, this.x2, this.y2];
    //         const {p1, p2} = this.getPointsFromCoordsArray(points);
    //         const minLength = this.getMinLengthFromArrowSize(this.strokeWidth);
    //         const currentLength = p1.distanceFrom(p2);
    //
    //         // Make sure line is not too short
    //         if (currentLength < minLength) {
    //             const newP1 = extrapolatePoints(p2, p1, minLength / currentLength);
    //             this.updateWithPoints(newP1, p2);
    //         }
    //     }
    //
    //     if (key === 'arrow2' && !previousArrow2 && newValue === true) {
    //         const points = [this.x1, this.y1, this.x2, this.y2];
    //         const {p1, p2} = this.getPointsFromCoordsArray(points);
    //         const minLength = this.getMinLengthFromArrowSize(this.strokeWidth);
    //         const currentLength = p1.distanceFrom(p2);
    //
    //         // Make sure line is not too short
    //         if (currentLength < minLength) {
    //             const newP2 = extrapolatePoints(p1, p2, minLength / currentLength);
    //             this.updateWithPoints(p1, newP2);
    //         }
    //     }
    //
    //     // if (key === 'canvas') {
    //     //     if (newValue) {
    //     //         // Canvas is set, we can use it
    //     //         this.addCanvasListeners();
    //     //     } else {
    //     //         this.removeCanvasListeners();
    //     //     }
    //     // }
    //
    //     return this;
    // }

});