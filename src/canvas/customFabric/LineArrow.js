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

fabric.LineAnnotateArrow = fabric.util.createClass(fabric.Object, {

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
});