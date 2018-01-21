var secrets = require('../config/secrets');

var Event = require('../models/event');

module.exports = function (router) {

    var homeRoute = router.route('/');

    homeRoute.get(function (req, res) {
      var connectionString = secrets.token;
      res.json({ message: 'My connection string is ' + connectionString });
    });

    var eventsRoute = router.route('/events');

    eventsRoute.get(function (req, res) {
      var query = Event.find({});

      query.exec(function (err, events) {
        if (err) return res.status(500);
        res.json({ message: 'OK', data: events });
      })
    });

    eventsRoute.post(function (req, res) {
      var errMsg = '';

      if (!req.body.name) {
        errMsg += 'An event name is required! ';
      }

      if (!req.body.points) {
        errMsg += 'A point value for the event is required! ';
      }

      if (!req.body.date) {
        errMsg += 'A date for the event is required! '
      }

      if (errMsg) {
        errMsg = 'Validation error(s): ' + err;
        return res.status(500).json({ message: errMsg, data: [] });
      }

      var newEvent = new Event({
        name: req.body.name,
        date: req.body.date,
        points: req.body.points
      });

      newEvent.save(function (err) {
        if (err) return res.status(500).json({ message: 'Error with creating the event', data: [] });
        res.status(201).json({ message: 'Event created!', data: newEvent });
      });
    })

    var eventIdRoute = router.route('/events/:id');

    eventIdRoute.get(function (req, res) {
        Event.findOne({ _id: req.params.id }, function (err, event) {
            if (err || !event) return res.status(404).json({ message: 'Event not found', data: [] });
            res.json({ message: 'OK', data: event });
        })
    });

    var netIdRoute = router.route('/users/:id');

    netIdRoute.get(function (req, res) {
      var query = Event.find({});
      query.exec(function (err, events) {
        if (err) return res.status(500);

        var total_pts = 0;
        var attended_events = [];

        events.forEach(function (event) {
          if(event.attendees.includes(req.params.id)) {
            total_pts += event.points;
            attended_events.push(event);
          }
        })

        res.json({ message: 'Total number of points for ' + req.params.id + ': ' + total_pts, data: attended_events })
      })
    });

    return router;
}
