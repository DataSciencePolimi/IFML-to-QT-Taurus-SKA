// Copyright (c) 2017, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by the MIT license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    almost = require('almost'),
    Rule = almost.Rule,
    createRule = almost.createRule,
    AException = almost.Exception;

exports.rules = [
    createRule(
        Rule.always,
        function (model) {
          var controls = _.chain(model.elements)
                  .filter(function (e) { return model.isViewElement(e); })
                  .value(),
              children = model.getTopLevels(),
              events = _.chain(model.elements)
                  .filter(function (e) { return model.isEvent(e); })
                  .filter(function (e) { return model.getOutbounds(e).length; })
                  .map(function(e) { return {id: e.id.replace(/-/g, "_"), source: model.getParentId(e), target: e.attributes.name}; })
                  .value(),
              actions = _.chain(model.elements)
                  .filter(function (e) { return model.isAction(e); })
                  .filter(function (a) { return model.getInbounds(a).length; })
                  .value(),
              defaultChild = _.chain(children)
                  .filter(function (id) { return model.isDefault(id); })
                  .first()
                  .value(),
              landmarks = _.chain(children)
                  .filter(function (e) { return model.isLandmark(e); })
                  .map(function (id) { return model.toElement(id); })
                  .map(function (e) { return {id: e.id, name: e.attributes.name}; })
                  .value(),
              collections = _.chain(model.elements)
                  .filter(function (e) { return model.isViewComponent(e); })
                  .reject({attributes: {stereotype: 'form'}})
                  .map(function (c) {
                      if (c.attributes.collection) {
                          return c.attributes.collection;
                      }
                      throw new AException('Collection cannot be empty\n(ViewComponent id:' + c.id + ')');
                  })
                  .uniq()
                  .value();
            return {
                '': {isFolder: true, children: 'pyqtexample'},
                'pyqtexample' : { isFolder: true, name: 'pyqtexample', children: ['lib', 'main']},
                'lib': {isFolder: true, name: 'lib', children: ['controls', 'repositories', 'navigations', 'actions']},
                'controls': {isFolder: true, name: 'controls', children: ['mainapp']},
                'main': {name: 'main.py', content: require('./templates/main.py.ejs')()},
                'mainapp': {name: 'mainapp.py', content: require('./templates/mainapp.py.ejs')({children: children, defaultChild: defaultChild, landmarks: landmarks, events: events})},
                'repositories': {isFolder: true, name: 'repositories'},
                'navigations': {isFolder: true, name: 'navigations'},
                'actions': {isFolder: true, name: 'actions'}
            };
        }
    ),
    createRule(
      Rule.always,
      function (model) {
          var collections = _.chain(model.elements)
                  .filter(function (e) { return model.isViewComponent(e); })
                  .reject({attributes: {stereotype: 'form'}})
                  .map(function (component) {
                      return {
                          name: component.attributes.collection,
                          fields: _.chain(component.attributes.fields).concat(component.attributes.filters).compact().value()
                      };
                  })
                  .groupBy('name')
                  .values()
                  .map(function (elements) {
                      return {name: _.first(elements).name, fields: _.chain(elements).map('fields').flatten().uniq().value() };
                  })
                  .value(),
              obj = {
                  'repositories': {children: _.map(collections, function (c) { return c.name; })},
              };
          _.each(collections, function (c) {
              obj[c.name] = {name: c.name + '.json', content: require('./templates/repository.json.ejs')({name: c.name, fields: c.fields})};
          });
          return obj;
      }
  )

];
