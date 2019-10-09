// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by the MIT license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    pcn = require('../../../pcn').pcn,
    createRule = require('almost').createRule;

exports.rules = [
    createRule( // map list
        function (element, model) { return model.isViewComponent(element) && element.attributes.stereotype === 'list'; },
        function (component, model) {
            var id = model.toId(component),
                name = component.attributes.name,
                collection = component.attributes.collection,
                filters = component.attributes.filters,
                fields = component.attributes.fields,
                incomings = _.chain(model.getInbounds(id))
                    .filter(function (id) { return model.isDataFlow(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (flow) {
                        var source = model.getSource(flow);
                        return {source: source.id, bindings: flow.attributes.bindings };
                    })
                    .value(),
                outgoings = _.chain(model.getOutbounds(id))
                    .filter(function (id) { return model.isDataFlow(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (flow) {
                        var target = model.getTarget(flow);
                        return {target: target.id, bindings: flow.attributes.bindings };
                    })
                    .value(),
                showSelection = outgoings.length !== 0,
                unfilteredevents = _.chain(model.getChildren(id))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (event) { return model.getOutbounds(event).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) { return { id: model.toId(event), name: event.attributes.name, stereotype: event.attributes.stereotype}; })
                    .value(),
                events = _.chain(unfilteredevents)
                    .reject({stereotype: 'selection'})
                    .value(),
                selection = _.chain(unfilteredevents)
                    .filter({stereotype: 'selection'})
                    .first()
                    .value(),
                obj = {
                    controls: {children: 'C-' + id}
                };
            //obj['C-' + id] = {isFolder: true, name: 'c-' + id, children: ['C-' + id + '-VM', 'C-' + id + '-V']};
            obj['C-' + id] = {name: id + '.py', content: require('./templates/list.py.ejs')({id: id, selection: selection, showSelection: showSelection, collection: collection, filters: filters, fields: fields, incomings: incomings, events: events})};
            return obj;
        }
    ),
    createRule( // map details
        function (element, model) { return model.isViewComponent(element) && element.attributes.stereotype === 'details'; },
        function (component, model) {
            var id = model.toId(component),
                name = component.attributes.name,
                collection = component.attributes.collection,
                fields = component.attributes.fields,
                incomings = _.chain(model.getInbounds(id))
                    .filter(function (id) { return model.isDataFlow(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (flow) {
                        var source = model.getSource(flow);
                        return {source: source.id, bindings: flow.attributes.bindings };
                    })
                    .value(),
                events = _.chain(model.getChildren(id))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (id) { return model.getOutbounds(id).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) { return { id: model.toId(event), name: event.attributes.name, stereotype: event.attributes.stereotype}; })
                    .value(),
                obj = {
                    controls: {children: 'C-' + id}
                };
            //obj['C-' + id] = {isFolder: true, name: 'c-' + id, children: ['C-' + id + '-VM', 'C-' + id + '-V']};
            obj['C-' + id] = {name: id + '.py', content: require('./templates/details.py.ejs')({id: id, name: name, events: events, collection: collection, fields: fields, incomings: incomings})};
            return obj;
        }
    ),
    createRule( // map form
        function (element, model) { return model.isViewComponent(element) && element.attributes.stereotype === 'form'; },
        function (component, model) {
            var id = model.toId(component),
                name = component.attributes.name,
                fields = component.attributes.fields,
                incomings = _.chain(model.getInbounds(id))
                    .filter(function (id) { return model.isDataFlow(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (flow) {
                        var source = model.getSource(flow);
                        return {source: source.id, bindings: flow.attributes.bindings };
                    })
                    .value(),
                events = _.chain(model.getChildren(id))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (id) { return model.getOutbounds(id).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) { return { id: model.toId(event), name: event.attributes.name, stereotype: event.attributes.stereotype}; })
                    .value(),
                obj = {
                    controls: {children: 'C-' + id}
                };
            //obj['C-' + id] = {isFolder: true, name: 'c-' + id, children: ['C-' + id + '-VM', 'C-' + id + '-V']};
            obj['C-' + id] = {name: id + '.py', content: require('./templates/form.py.ejs')({id: id, name: name, events: events, fields: fields, incomings: incomings})};
            return obj;
        }
    )
];
