import {
  props as layerProps,
  setup as layerSetup,
} from "@vue-leaflet/vue-leaflet/src/functions/layer";

export const props = {
  ...layerProps,
  pane: {
    type: String,
    default: "markerPane",
  },
  draggable: {
    type: Boolean,
    custom: true,
    default: false,
  },
  latLng: {
    type: [Object, Array],
    custom: true,
    default: null,
  },
  icon: {
    type: [Object],
    default: () => undefined,
    custom: false,
  },
  opacity: {
    type: Number,
    default: () => 1.0,
    custom: false,
  },
  zIndexOffset: {
    type: Number,
    custom: false,
    default: null,
  },
  rotationAngle: {
    type: Number,
    custom: true,
    default: 0,
  },
  rotationOrigin: {
    type: String,
    custom: false,
    default: "bottom center",
  },
};

export const setup = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = layerSetup(
    props,
    leafletRef,
    context
  );
  const options = {
    ...layerOptions,
    ...props,
  };

  const methods = {
    ...layerMethods,
    setDraggable(value) {
      if (leafletRef.value.dragging) {
        value
          ? leafletRef.value.dragging.enable()
          : leafletRef.value.dragging.disable();
      }
    },
    latLngSync(event) {
      context.emit("update:latLng", event.latlng);
      context.emit("update:lat-lng", event.latlng);
    },
    setOpacity(newVal) {
      if (leafletRef.value) {
        leafletRef.value.setOpacity(newVal);
      }
    },
    setLatLng(newVal) {
      if (newVal == null) {
        return;
      }

      if (leafletRef.value) {
        const oldLatLng = leafletRef.value.getLatLng();
        if (!oldLatLng || !oldLatLng.equals(newVal)) {
          leafletRef.value.setLatLng(newVal);
        }
      }
    },
    setRotationAngle(value) {
      if (leafletRef.value) {
        leafletRef.value.setRotationAngle(value);
      }
    },
  };
  return { options, methods };
};

export function initRotatedMarker(L) {
  // save these original methods before they are overwritten
  var proto_initIcon = L.Marker.prototype._initIcon;
  var proto_setPos = L.Marker.prototype._setPos;

  var oldIE = L.DomUtil.TRANSFORM === "msTransform";

  L.Marker.addInitHook(function () {
    var iconOptions = this.options.icon && this.options.icon.options;
    var iconAnchor = iconOptions && this.options.icon.options.iconAnchor;
    if (iconAnchor) {
      iconAnchor = iconAnchor[0] + "px " + iconAnchor[1] + "px";
    }
    this.options.rotationOrigin =
      this.options.rotationOrigin || iconAnchor || "center bottom";
    this.options.rotationAngle = this.options.rotationAngle || 0;

    // Ensure marker keeps rotated during dragging
    this.on("drag", function (e) {
      e.target._applyRotation();
    });
  });

  L.Marker.include({
    _initIcon: function () {
      proto_initIcon.call(this);
    },

    _setPos: function (pos) {
      proto_setPos.call(this, pos);
      this._applyRotation();
    },

    _applyRotation: function () {
      if (this.options.rotationAngle) {
        this._icon.style[L.DomUtil.TRANSFORM + "Origin"] =
          this.options.rotationOrigin;

        if (oldIE) {
          // for IE 9, use the 2D rotation
          this._icon.style[L.DomUtil.TRANSFORM] =
            "rotate(" + this.options.rotationAngle + "deg)";
        } else {
          // for modern browsers, prefer the 3D accelerated version
          this._icon.style[L.DomUtil.TRANSFORM] +=
            " rotateZ(" + this.options.rotationAngle + "deg)";
        }
      }
    },

    setRotationAngle: function (angle) {
      this.options.rotationAngle = angle;
      this.update();
      return this;
    },

    setRotationOrigin: function (origin) {
      this.options.rotationOrigin = origin;
      this.update();
      return this;
    },
  });
}
