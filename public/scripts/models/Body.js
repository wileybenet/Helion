angular.module('Body', ['Map'])
  .service('Body', ['Base', 'Map', 'Resource', 'Emitter', 'Loader', 'Canvas', 'Utils',
  function(Base, Map, Resource, Emitter, Loader, Canvas, Utils) {
    var endpoint = '/api/v1/body/:id',
      crudApi = Resource(endpoint, {}, {}),
      groupId = 0;

    return Base.extend({
      all: crudApi.query,
      create: crudApi.save
    }, {
      initialize: function Body(model) {
        if (!model)
          return;
        var this_ = this,
          ratio = $(window).width(),
          radius = model.config.radius / 100 * ratio,
          options = model.config || {},
          resource = Resource(endpoint, { id: '@_id' }, {});

        this.model = new resource(model);

        this.name = model.name;
        this.color = Utils.luminosity(options.fill, 0);
        this.object = new Path.Circle({
          radius: radius,
          center: new Point(model.position[0] / 100 * ratio, model.position[1] / 100 * ratio),
        });

        this.object.fillColor = {
          gradient: {
            stops: [
              [Utils.luminosity(options.fill, 0.2), 0.05],
              [Utils.luminosity(options.fill, -0.1), 0.3],
              [Utils.luminosity(options.fill, -0.5), 0.7], ['#000', 1]
            ],
            radial: true
          },
          origin: [this.object.position.x-(radius*0.5), this.object.position.y],
          destination: this.object.bounds.rightCenter,
        };


        this.objectNightShade = this.object.clone();
        this.objectNightShade.fillColor = {
          gradient: {
            stops: [
              new Color(0,0,0,0),
              new Color(0,0,0,0.3),
              new Color(0,0,0,0.7),
              new Color(0,0,0,1)
            ],
            radial: true
          },
          origin: [this.object.position.x-(radius*0.75), this.object.position.y],
          destination: this.object.bounds.rightCenter,
        };

        this.objectDropShadow = this.object.clone();
        this.objectDropShadow.style = {
          shadowColor: '#000',
          shadowBlur: 6,
          shadowOffset: new Point(5, 5),
          // strokeColor: options.stroke ? Utils.luminosity(options.stroke, -0.3) : '#000',
          // strokeWidth: options.strokeWidth || 2,
          // strokeOpacity: options.strokeOpacity || 0.2
        };

        if (options.stroke) {
          this.objectDropShadow.shadowColor = Utils.luminosity(options.shadow || options.stroke, 0);
          this.objectDropShadow.shadowBlur = 30;
          this.objectDropShadow.shadowOffset = new Point(0, 0);
        }

        this.clippingGroup = new Group([
          this.object,
          this.objectNightShade
        ]);

        // this.clippingGroup.clipped = true;

        this.path = new Group([
          this.objectDropShadow,
          this.clippingGroup
        ]);

        this.path.onMouseUp = this.onMouseUp.bind(this);
        this.path.onMouseDrag = this.onMouseDrag.bind(this);

        Canvas.bodies.addChild(this.path);

        Emitter.on('camera:reset', function(evt) {
          if (this_._focused) {
            this_._focused = false;
          }
          this_.objectNightShade.visible = true;
          this_.objectNightShade.fillColor.gradient.stops = [
            new Color(0,0,0,0),
            new Color(0,0,0,0.3),
            new Color(0,0,0,0.7),
            new Color(0,0,0,1)
          ];
        });
        this.model.on('update', function() {
          this_.object.scale((this.config.radius / 100 * ratio) / radius);
          this_.object.position = new Point(this.position[0] / 100 * ratio, this.position[1] / 100 * ratio);
          radius = this.config.radius / 100 * ratio;
          this_.focus();
          paper.view.draw();
        });

        Loader.get(this.name).then(function(group) {
          this_.map = new Map.KavrayskiyVII(group, this_.object.clone());
          this_.clippingGroup.insertChild(1, this_.map.path);
          this_.map.revolve();
        });
      },
      onMouseDrag: function onMouseDrag(evt) {
        if (this._focused) {
          this.map.stop && this.map.stop();
          this.map.rotate(evt.delta.x);
        }
      },
      onMouseUp: function onMouseUp(evt) {
        var this_ = this;

        if (this._focused)
          return false;

        Canvas.focusCamera(this.object.position, 15 / this.model.config.radius, function(position) {
          this_.objectNightShade.fillColor.gradient.stops = [
            new Color(0,0,0,0),
            new Color(0,0,0,0.3 - 0.3 * position),
            new Color(0,0,0,0.7 - 0.7 * position),
            new Color(0,0,0,1 - position)
          ];
        }, function() {
          this_.objectNightShade.visible = false;
        });
        this._focused = true;
      },
      focus: function focus() {
        this.onMouseUp();
      },
      bs: 10
    });
  }]);