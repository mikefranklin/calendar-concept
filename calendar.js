"use strict";
"use babel";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var App = function () {
    function App() {
        var _this = this;

        _classCallCheck(this, App);

        Immutable.List("Grid,Row,Col,Modal,ButtonGroup,Button,Overlay,DropdownButton,MenuItem,Badge,Label,Table".split(",")).forEach(function (m) {
            return window[m] = ReactBootstrap[m];
        }); // pollute global namespace for convenience
        var pairs = Immutable.List("\n                    dataloaded            # just for initial loading\n                    addGroupClicked: addGroup\n                    groupsUpdated\n                    userClicked:toggleUser\n                    dateGroupUpdated\n                    userCommentClicked\n                    saveUserCommentClicked:updateUserComment\n                    monthChangeClicked:changeMonth\n                    editableClicked:toggleEditable\n                    editableSet\n                ".split(/\n/)).filter(function (pair) {
            return pair;
        }).map(function (pair) {
            return pair.split("#")[0].replace(/\s+/g, "").split(":");
        });
        this.on = pairs.reduce(function (map, pair) {
            return map.set(pair[0], new signals.Signal());
        }, Immutable.Map()).toJS();
        pairs.filter(function (pair) {
            return pair[1];
        }).forEach(function (pair) {
            return _this.on[pair[0]].add(_this[pair[1]].bind(_this));
        });
        this.store = {};
        this.const = { show: { addButton: 0, addEntry: 1, editEntry: 2 } };
        if (!window.console) console = { log: function log() {} };
    }

    _createClass(App, [{
        key: "start",
        value: function start() {
            this.initializeDataStore();
        }
    }, {
        key: "dateInt",
        value: function dateInt(dt) {
            return parseInt(dt.valueOf() / 86400000);
        }
    }, {
        key: "getFirstSunday",
        value: function getFirstSunday(date) {
            var dt = new Date(date),
                day = dt.getDay(),
                diff = dt.getDate() - day;

            dt.setDate(diff);
            return dt;
        }
    }, {
        key: "addGroup",
        value: function addGroup(text) {
            var groups = this.store.groups;
            this.store.groups = groups.push(Immutable.Map({ name: text, id: groups.size + 1 }));
            this.on.groupsUpdated.dispatch(this.store);
        }
    }, {
        key: "toggleUser",
        value: function toggleUser(date, groupId, userId, add) {
            this.store.data = add && this.store.data.setIn([date, groupId, userId], "") || this.store.data.removeIn([date, groupId, userId]);
            this.on.dateGroupUpdated.dispatch(date, groupId, this.store.data.getIn([date, groupId]));
        }
    }, {
        key: "updateUserComment",
        value: function updateUserComment(date, groupId, userId, comment) {
            this.store.data = this.store.data.setIn([date, groupId, userId], comment);
        }
    }, {
        key: "changeMonth",
        value: function changeMonth(offset) {
            this.store.date.setMonth(this.store.month + offset);
            this.store.month = this.store.date.getMonth();
            this.store.firstSunday = this.getFirstSunday(this.store.date);
            this.on.dataloaded.dispatch(this.store);
        }
    }, {
        key: "toggleEditable",
        value: function toggleEditable(value) {
            this.store.editable = value;
            this.on.editableSet.dispatch(value);
        }
    }, {
        key: "initializeDataStore",
        value: function initializeDataStore() {
            this.store.calendar = Immutable.fromJS({
                name: "Sample Calendar"
            });
            this.store.date = new Date("3/1/2016");
            this.store.month = this.store.date.getMonth();
            this.store.firstSunday = this.getFirstSunday(this.store.date);
            this.store.groups = Immutable.List();
            this.store.editable = false;
            this.store.users = Immutable.fromJS([{ id: 1, name: "Zuyev, Aalok" }, { id: 2, name: "Zussman, Aaron" }, { id: 3, name: "Zusman, Aarti" }, { id: 4, name: "Zuckerman, Abby" }, { id: 5, name: "Zucker, Abeel" }, { id: 6, name: "Zolotorevsky, Adam " }, { id: 7, name: "Zolit, Adela" }, { id: 8, name: "Zoda, Adelaide" }, { id: 9, name: "Zirkin, Aditya" }]);
            this.store.data = Immutable.Map();
            /*
            data = {date: {groupId: {userid: comment}}}
            */
            this.on.dataloaded.dispatch(this.store);
        }
    }]);

    return App;
}();

var Calendar = function (_React$Component) {
    _inherits(Calendar, _React$Component);

    function Calendar(props) {
        _classCallCheck(this, Calendar);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Calendar).call(this, props));

        _this2.state = { showEdit: true };
        app.on.dataloaded.add(function (s) {
            return _this2.setState(s);
        });
        app.on.groupsUpdated.add(function (s) {
            return _this2.setState(s);
        });
        app.on.editableSet.add(function (value) {
            return _this2.setState({ editable: value });
        });
        return _this2;
    }

    _createClass(Calendar, [{
        key: "getWeeks",
        value: function getWeeks(weeks, month, date, groups, users, data, editable) {
            var nextWeek = function nextWeek(d) {
                var dt = new Date(d);dt.setDate(dt.getDate() + 7);return dt;
            };
            return date.getMonth() > month && weeks || this.getWeeks(weeks.push(React.createElement(Week, {
                key: app.dateInt(date),
                date: date,
                month: month,
                groups: groups,
                users: users,
                data: data,
                editable: editable })), month, nextWeek(date), groups, users, data, editable);
        }
    }, {
        key: "render",
        value: function render() {
            if (!this.state.calendar) return false;
            var _state = this.state;
            var calendar = _state.calendar;
            var date = _state.date;
            var month = _state.month;
            var firstSunday = _state.firstSunday;
            var groups = _state.groups;
            var users = _state.users;
            var data = _state.data;
            var editable = _state.editable;

            return React.createElement(
                "div",
                null,
                React.createElement(
                    Grid,
                    { fluid: true },
                    React.createElement(Header, {
                        title: calendar.get("name"),
                        date: date }),
                    this.state.showEdit && React.createElement(CalendarEditor, { editable: editable }),
                    this.getWeeks(Immutable.List([]), month, firstSunday, groups, users, data, editable)
                )
            );
        }
    }]);

    return Calendar;
}(React.Component);

var CalendarEditor = function (_React$Component2) {
    _inherits(CalendarEditor, _React$Component2);

    function CalendarEditor(props) {
        _classCallCheck(this, CalendarEditor);

        // 0 - show add button, 1 - input/save, 2 - input/edit

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(CalendarEditor).call(this, props));

        _this3.state = { groupEdit: app.const.show.addButton, newGroup: "" };
        app.on.addGroupClicked.add(function () {
            return _this3.updateGroupState(app.const.show.addButton, null);
        });
        return _this3;
    }

    _createClass(CalendarEditor, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            var elem = ReactDOM.findDOMNode(this.refs.groupName);
            elem && elem.focus();
        }
    }, {
        key: "updateGroupName",
        value: function updateGroupName(event) {
            this.setState({ newGroup: event.target.value });
        }
    }, {
        key: "updateGroupState",
        value: function updateGroupState(value, text) {
            this.setState({ groupEdit: value, newGroup: text || "" });
        }
    }, {
        key: "render",
        value: function render() {
            var editable = this.props.editable;

            return editable && React.createElement(
                Row,
                { style: { padding: "5px 0" } },
                React.createElement(
                    Col,
                    {
                        md: 8,
                        mdOffset: 2 },
                    this.state.groupEdit == app.const.show.addButton && React.createElement(
                        Button,
                        {
                            onClick: this.updateGroupState.bind(this, app.const.show.addEntry, null),
                            bsSize: "small",
                            bsStyle: "default" },
                        "add group"
                    ),
                    this.state.groupEdit == app.const.show.addEntry && React.createElement(
                        "span",
                        null,
                        React.createElement("input", {
                            ref: "groupName",
                            defaultValue: this.state.newGroup,
                            onChange: this.updateGroupName.bind(this) }),
                        React.createElement(
                            Button,
                            {
                                style: { marginLeft: 3 },
                                onClick: app.on.addGroupClicked.dispatch.bind(null, this.state.newGroup),
                                bsSize: "small",
                                bsStyle: "default" },
                            "add group"
                        ),
                        React.createElement(
                            Button,
                            {
                                style: { marginLeft: 3 },
                                onClick: this.updateGroupState.bind(this, app.const.show.addButton, null),
                                bsSize: "small",
                                bsStyle: "default" },
                            "cancel"
                        )
                    )
                ),
                React.createElement(
                    Col,
                    { md: 1 },
                    React.createElement(
                        Button,
                        {
                            onClick: app.on.editableClicked.dispatch.bind(null, false),
                            bsSize: "small",
                            bsStyle: "default" },
                        "view"
                    )
                )
            ) || React.createElement(
                Row,
                null,
                React.createElement(
                    Col,
                    {
                        md: 1,
                        mdOffset: 10 },
                    React.createElement(
                        Button,
                        {
                            onClick: app.on.editableClicked.dispatch.bind(null, true),
                            bsSize: "small",
                            bsStyle: "default" },
                        "edit"
                    )
                )
            );
        }
    }]);

    return CalendarEditor;
}(React.Component);

var Header = function (_React$Component3) {
    _inherits(Header, _React$Component3);

    function Header() {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Header).apply(this, arguments));
    }

    _createClass(Header, [{
        key: "render",
        value: function render() {
            var _props = this.props;
            var title = _props.title;
            var date = _props.date;

            return React.createElement(
                "span",
                null,
                React.createElement(
                    "h2",
                    { style: { textAlign: "center" } },
                    title
                ),
                React.createElement(
                    "h4",
                    { style: { textAlign: "center" } },
                    React.createElement("i", {
                        onClick: app.on.monthChangeClicked.dispatch.bind(null, -1),
                        style: { marginRight: 10, marginTop: 2 },
                        className: "fa fa-chevron-left changemonth" }),
                    date.getMonth() + 1 + "/" + date.getFullYear(),
                    React.createElement("i", {
                        onClick: app.on.monthChangeClicked.dispatch.bind(null, 1),
                        style: { marginLeft: 10, marginTop: 2 },
                        className: "fa fa-chevron-right changemonth" })
                )
            );
        }
    }]);

    return Header;
}(React.Component);

var UserDropdown = function (_React$Component4) {
    _inherits(UserDropdown, _React$Component4);

    function UserDropdown() {
        _classCallCheck(this, UserDropdown);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(UserDropdown).apply(this, arguments));
    }

    _createClass(UserDropdown, [{
        key: "render",
        value: function render() {
            var _props2 = this.props;
            var users = _props2.users;
            var date = _props2.date;
            var groupId = _props2.groupId;
            var list = users.map(function (u) {
                return React.createElement(
                    "li",
                    {
                        onClick: app.on.userClicked.dispatch.bind(null, date, groupId, u.get("id"), true),
                        key: u.get("id") },
                    u.get("name")
                );
            });
            return React.createElement(
                "div",
                { className: "btn-group" },
                React.createElement(
                    "button",
                    {
                        style: { cursor: "pointer" },
                        className: "btn btn-default btn-xs dropdown-toggle useradd",
                        type: "button",
                        "data-toggle": "dropdown" },
                    React.createElement("i", { className: "fa fa-user" }),
                    React.createElement("span", {
                        style: { marginLeft: 3 },
                        className: "hc caret" })
                ),
                React.createElement(
                    "ul",
                    {
                        style: { maxHeight: 400, overflow: "scroll" },
                        className: "dropdown-menu pull-right userlist" },
                    list
                )
            );
        }
    }]);

    return UserDropdown;
}(React.Component);

var Week = function (_React$Component5) {
    _inherits(Week, _React$Component5);

    function Week() {
        _classCallCheck(this, Week);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Week).apply(this, arguments));
    }

    _createClass(Week, [{
        key: "render",
        value: function render() {
            var _props3 = this.props;
            var date = _props3.date;
            var month = _props3.month;
            var groups = _props3.groups;
            var users = _props3.users;
            var data = _props3.data;
            var editable = _props3.editable;
            var days = [].concat(_toConsumableArray(Array(7).keys())).map(function (offset) {
                var dt = new Date(date);dt.setDate(dt.getDate() + offset);return dt;
            });
            var dates = days.map(function (dt) {
                return React.createElement(
                    Col,
                    {
                        key: app.dateInt(dt),
                        style: { backgroundColor: "#eee", borderTop: "solid #ccc 1px", borderRight: "solid #ccc 1px" },
                        md: 1 },
                    dt.getDate()
                );
            });
            return React.createElement(
                "div",
                { style: { minHeight: 100 } },
                React.createElement(
                    Row,
                    null,
                    React.createElement(Col, {
                        md: 1,
                        mdOffset: 2,
                        style: { borderTop: "solid #ccc 1px" } }),
                    dates
                ),
                groups.map(function (g) {
                    return React.createElement(
                        Row,
                        { key: g.get("id") },
                        React.createElement(
                            Col,
                            {
                                md: 1,
                                mdOffset: 2,
                                style: { borderTop: "solid #eee 1px" } },
                            g.get("name")
                        ),
                        days.map(function (dt) {
                            return React.createElement(DateGroup, {
                                key: g.get("id") + "_" + app.dateInt(dt),
                                groupId: g.get("id"),
                                date: dt,
                                users: users,
                                editable: editable,
                                data: data.getIn([dt, g.get("id")]) });
                        })
                    );
                })
            );
        }
    }]);

    return Week;
}(React.Component);

var DateGroup = function (_React$Component6) {
    _inherits(DateGroup, _React$Component6);

    function DateGroup(props) {
        _classCallCheck(this, DateGroup);

        var _this7 = _possibleConstructorReturn(this, Object.getPrototypeOf(DateGroup).call(this, props));

        _this7.state = _extends({}, props);
        app.on.dateGroupUpdated.add(_this7.update.bind(_this7));
        app.on.editableSet.add(function (value) {
            return _this7.setState({ editable: value });
        });
        return _this7;
    }

    _createClass(DateGroup, [{
        key: "update",
        value: function update(date, groupId, data) {
            date == this.state.date && groupId == this.state.groupId && this.setState({ data: data });
        }
    }, {
        key: "render",
        value: function render() {
            var _state2 = this.state;
            var groupId = _state2.groupId;
            var date = _state2.date;
            var users = _state2.users;
            var data = _state2.data;
            var editable = _state2.editable;
            var selected = data && data.map(function (comment, userId) {
                return React.createElement(User, {
                    key: userId,
                    user: users.find(function (u) {
                        return u.get("id") == userId;
                    }),
                    comment: comment,
                    date: date,
                    editable: editable,
                    groupId: groupId });
            }).toList();
            var unselected = data && users.filter(function (u) {
                return !data.has(u.get("id"));
            }) || users;
            return React.createElement(
                Col,
                {
                    className: "daygroup",
                    style: { borderTop: "solid #eee 1px", borderRight: "solid #ccc 1px" },
                    md: 1 },
                editable && unselected && unselected.size && React.createElement(UserDropdown, {
                    users: unselected,
                    date: date,
                    groupId: groupId }) || false,
                selected
            );
        }
    }]);

    return DateGroup;
}(React.Component);

var User = function (_React$Component7) {
    _inherits(User, _React$Component7);

    function User(props) {
        _classCallCheck(this, User);

        var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(User).call(this, props));

        _this8.state = _extends({}, props, { commentState: app.const.show.addButton });
        app.on.userCommentClicked.add(function () {
            return _this8.updateCommentState(app.const.show.addButton, null);
        });
        app.on.editableSet.add(_this8.setEditable, _this8);
        return _this8;
    }

    _createClass(User, [{
        key: "updateCommentState",
        value: function updateCommentState(value, text) {
            this.setState({ commentState: value, newComment: text || "" });
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            app.on.editableSet.remove(this.setEditable, this);
        }
    }, {
        key: "setEditable",
        value: function setEditable(value) {
            this.setState({ editable: value });
        }
    }, {
        key: "updateComment",
        value: function updateComment(event) {
            this.setState({ newComment: event.target.value });
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            var elem = ReactDOM.findDOMNode(this.refs.comment);
            elem && elem.focus();
        }
    }, {
        key: "saveComment",
        value: function saveComment() {
            var s = this.state;
            this.setState({ commentState: app.const.show.addButton, comment: s.newComment });
            app.on.saveUserCommentClicked.dispatch(s.date, s.groupId, s.user.get("id"), s.newComment);
        }
    }, {
        key: "render",
        value: function render() {
            var _state3 = this.state;
            var user = _state3.user;
            var groupId = _state3.groupId;
            var date = _state3.date;
            var comment = _state3.comment;
            var commentState = _state3.commentState;
            var editable = _state3.editable;
            var userId = user.get("id");
            var displayOnly = commentState == app.const.show.addButton;
            return React.createElement(
                "div",
                {
                    className: "user",
                    style: { whiteSpace: "nowrap", overflow: "hidden", fontSize: 11 } },
                editable && React.createElement("i", {
                    style: { marginRight: 3 },
                    className: "delete fa fa-times",
                    onClick: app.on.userClicked.dispatch.bind(null, date, groupId, userId, false) }) || false,
                editable && displayOnly && React.createElement("i", {
                    style: { marginRight: 3 },
                    className: "comment fa fa-pencil-square-o",
                    onClick: this.updateCommentState.bind(this, app.const.show.editEntry, comment) }) || false,
                user.get("name"),
                comment && (displayOnly || !editable) && React.createElement(
                    "div",
                    { style: { fontStyle: "italic" } },
                    comment
                ) || null,
                editable && this.state.commentState == app.const.show.editEntry && React.createElement(
                    "div",
                    null,
                    React.createElement("input", {
                        style: { width: "100%" },
                        ref: "comment",
                        defaultValue: this.state.newComment,
                        onBlur: this.saveComment.bind(this),
                        onChange: this.updateComment.bind(this) })
                )
            );
        }
    }]);

    return User;
}(React.Component);