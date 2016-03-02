"use babel";

class App {
    constructor() {
        Immutable.List("Grid,Row,Col,Modal,ButtonGroup,Button,Overlay,DropdownButton,MenuItem,Badge,Label,Table"
            .split(","))
            .forEach(m => window[m] = ReactBootstrap[m]) // pollute global namespace for convenience
        var pairs = Immutable.List(`
                    dataloaded            # just for initial loading
                    addGroupClicked: addGroup
                    groupsUpdated
                    userClicked:toggleUser
                    dateGroupUpdated
                    userCommentClicked
                    saveUserCommentClicked:updateUserComment
                    monthChangeClicked:changeMonth
                    editableClicked:toggleEditable
                    editableSet
                `.split(/\n/))
                .filter(pair => pair)
                .map(pair => pair.split("#")[0].replace(/\s+/g, "").split(":"));
        this.on = pairs
                    .reduce((map, pair) => map.set(pair[0], new signals.Signal()), Immutable.Map())
                    .toJS()
        pairs.filter(pair => pair[1])
                .forEach(pair => this.on[pair[0]].add(this[pair[1]].bind(this)))
        this.store = {}
        this.const = {show: {addButton: 0, addEntry: 1, editEntry: 2}}
        if (!window.console) console = {log: function() {}};
    }
    start() {
        this.initializeDataStore()
    }
    dateInt(dt) {
        return parseInt(dt.valueOf() / 86400000)
    }
    getFirstSunday(date) {
        var dt = new Date(date),
            day = dt.getDay(),
            diff = dt.getDate() - day;

        dt.setDate(diff)
        return dt
    }
    addGroup(text) {
        var groups = this.store.groups
        this.store.groups = groups.push(Immutable.Map({name: text, id: groups.size + 1}))
        this.on.groupsUpdated.dispatch(this.store)
    }
    toggleUser(date, groupId, userId, add) {
        this.store.data = add && this.store.data.setIn([date, groupId, userId], "")
                            || this.store.data.removeIn([date, groupId, userId])
        this.on.dateGroupUpdated.dispatch(date, groupId, this.store.data.getIn([date, groupId]))
    }
    updateUserComment(date, groupId, userId, comment) {
        this.store.data = this.store.data.setIn([date, groupId, userId], comment)
    }
    changeMonth(offset) {
        this.store.date.setMonth(this.store.month + offset)
        this.store.month = this.store.date.getMonth()
        this.store.firstSunday = this.getFirstSunday(this.store.date)
        this.on.dataloaded.dispatch(this.store)
    }
    toggleEditable(value) {
        this.store.editable = value
        this.on.editableSet.dispatch(value)
    }
    initializeDataStore() {
        this.store.calendar = Immutable.fromJS({
            name: "Sample Calendar"
        })
        this.store.date = new Date("3/1/2016")
        this.store.month = this.store.date.getMonth()
        this.store.firstSunday = this.getFirstSunday(this.store.date)
        this.store.groups = Immutable.List()
        this.store.editable = false
        this.store.users = Immutable.fromJS([
            {id: 1, name: "Zuyev, Aalok"},
            {id: 2, name: "Zussman, Aaron"},
            {id: 3, name: "Zusman, Aarti"},
            {id: 4, name: "Zuckerman, Abby"},
            {id: 5, name: "Zucker, Abeel"},
            {id: 6, name: "Zolotorevsky, Adam "},
            {id: 7, name: "Zolit, Adela"},
            {id: 8, name: "Zoda, Adelaide"},
            {id: 9, name: "Zirkin, Aditya"}])
        this.store.data = Immutable.Map()
        /*
        data = {date: {groupId: {userid: comment}}}
        */
        this.on.dataloaded.dispatch(this.store)
    }
}
class Calendar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {showEdit: true}
        app.on.dataloaded.add(s => this.setState(s))
        app.on.groupsUpdated.add(s => this.setState(s))
        app.on.editableSet.add(value => this.setState({editable: value}))
    }
    getWeeks(weeks, month, date, groups, users, data, editable) {
        var nextWeek = (d) => {var dt = new Date(d); dt.setDate(dt.getDate() + 7); return dt}
        return date.getMonth() > month
            && weeks
            || this.getWeeks(weeks.push(
                <Week
                    key={app.dateInt(date)}
                    date={date}
                    month={month}
                    groups={groups}
                    users={users}
                    data={data}
                    editable={editable}/>), month, nextWeek(date), groups, users, data, editable)
    }
    render() {
        if (!this.state.calendar) return false
        var {calendar, date, month, firstSunday, groups, users, data, editable} = this.state;
        return (
            <div>
                <Grid fluid={true}>
                    <Header
                        title={calendar.get("name")}
                        date={date}/>
                    {this.state.showEdit && <CalendarEditor editable={editable}/>}
                    {this.getWeeks(Immutable.List([]), month, firstSunday, groups, users, data, editable)}
                </Grid>
            </div>
        )
    }
}

class CalendarEditor extends React.Component {
    constructor(props) {
        super(props); // 0 - show add button, 1 - input/save, 2 - input/edit
        this.state = {groupEdit: app.const.show.addButton, newGroup: ""}
        app.on.addGroupClicked.add( () => this.updateGroupState(app.const.show.addButton, null))
    }
    componentDidUpdate() {
        var elem = ReactDOM.findDOMNode(this.refs.groupName)
        elem && elem.focus()
    }
    updateGroupName(event) {
        this.setState({newGroup: event.target.value})
    }
    updateGroupState(value, text) {
        this.setState({groupEdit: value, newGroup: text || ""})
    }
    render() {
        var {editable} = this.props;
        return editable && (
            <Row style={{padding: "5px 0"}}>
                <Col
                    md={8}
                    mdOffset={2}>
                    {this.state.groupEdit == app.const.show.addButton && (
                        <Button
                            onClick={this.updateGroupState.bind(this, app.const.show.addEntry, null)}
                            bsSize="small"
                            bsStyle="default">
                            add group
                        </Button>)}
                    {this.state.groupEdit == app.const.show.addEntry && (
                        <span>
                            <input
                                ref="groupName"
                                defaultValue={this.state.newGroup}
                                onChange={this.updateGroupName.bind(this)}/>
                            <Button
                                style={{marginLeft: 3}}
                                onClick={app.on.addGroupClicked.dispatch.bind(null, this.state.newGroup)}
                                bsSize="small"
                                bsStyle="default">
                                add group
                            </Button>
                            <Button
                                style={{marginLeft: 3}}
                                onClick={this.updateGroupState.bind(this, app.const.show.addButton, null)}
                                bsSize="small"
                                bsStyle="default">
                                cancel
                            </Button>
                        </span>
                    )}
                </Col>
                <Col md={1}>
                    <Button
                        onClick={app.on.editableClicked.dispatch.bind(null, false)}
                        bsSize="small"
                        bsStyle="default">
                        view
                    </Button>
                </Col>
            </Row>
        ) || (
            <Row>
                <Col
                    md={1}
                    mdOffset={10}>
                    <Button
                        onClick={app.on.editableClicked.dispatch.bind(null, true)}
                        bsSize="small"
                        bsStyle="default">
                        edit
                    </Button>
                </Col>
            </Row>
        )
    }
}

class Header extends React.Component {
    render() {
        var {title, date} = this.props;
        return (
            <span>
                <h2 style={{textAlign: "center"}}>
                    {title}
                </h2>
                <h4 style={{textAlign: "center"}}>
                    <i
                        onClick={app.on.monthChangeClicked.dispatch.bind(null, -1)}
                        style={{marginRight: 10, marginTop: 2}}
                        className="fa fa-chevron-left changemonth">
                    </i>
                    {(date.getMonth() + 1) + "/" + date.getFullYear()}
                    <i
                        onClick={app.on.monthChangeClicked.dispatch.bind(null, 1)}
                        style={{marginLeft: 10, marginTop: 2}}
                        className="fa fa-chevron-right changemonth">
                    </i>
                </h4>
            </span>
        )
    }
}

class UserDropdown extends React.Component {
    render() {
        var {users, date, groupId} = this.props,
            list = users.map(u => (
                    <li
                        onClick={app.on.userClicked.dispatch.bind(null, date, groupId, u.get("id"), true)}
                        key={u.get("id")}>
                        {u.get("name")}
                    </li>
                ))
        return (
            <div className="btn-group">
                <button
                    style={{cursor: "pointer"}}
                    className="btn btn-default btn-xs dropdown-toggle useradd"
                    type="button"
                    data-toggle="dropdown">
                    <i className="fa fa-user"></i>
                    <span
                        style={{marginLeft: 3}}
                        className="hc caret">
                    </span>
                </button>
                <ul
                    style={{maxHeight: 400, overflow: "scroll"}}
                    className="dropdown-menu pull-right userlist">
                    {list}
                </ul>
            </div>
        )
    }
}

class Week extends React.Component {
    render() {
        var {date, month, groups, users, data, editable} = this.props,
            days = [...Array(7).keys()].map(offset => {var dt = new Date(date); dt.setDate(dt.getDate() + offset); return dt}),
            dates = days.map(dt => (
                    <Col
                        key={app.dateInt(dt)}
                        style={{backgroundColor: "#eee", borderTop: "solid #ccc 1px", borderRight: "solid #ccc 1px"}}
                        md={1}>
                        {dt.getDate()}
                    </Col>));
        return (
            <div style={{minHeight: 100}}>
                <Row>
                    <Col
                        md={1}
                        mdOffset={2}
                        style={{borderTop: "solid #ccc 1px"}}/>
                     {dates}
                </Row>
                {groups.map(g => (
                    <Row key={g.get("id")}>
                        <Col
                            md={1}
                            mdOffset={2}
                            style={{borderTop: "solid #eee 1px"}}>
                            {g.get("name")}
                        </Col>
                        {days.map(dt => (
                            <DateGroup
                                key={g.get("id") + "_" + app.dateInt(dt)}
                                groupId={g.get("id")}
                                date={dt}
                                users={users}
                                editable={editable}
                                data={data.getIn([dt, g.get("id")])}/>))}
                    </Row>
                ))}
            </div>
        )
    }
}

class DateGroup extends React.Component {
    constructor(props) {
        super(props)
        this.state = Object.assign({}, props)
        app.on.dateGroupUpdated.add(this.update.bind(this))
        app.on.editableSet.add(value => this.setState({editable: value}))
    }
    update(date, groupId, data) {
        date == this.state.date && groupId == this.state.groupId && this.setState({data: data})
    }
    render() {
        var {groupId, date, users, data, editable} = this.state,
            selected = data && data.map((comment, userId) => (
                    <User
                        key={userId}
                        user={users.find(u => u.get("id") == userId)}
                        comment={comment}
                        date={date}
                        editable={editable}
                        groupId={groupId}/>
                )).toList(),
            unselected = data && users.filter(u => !data.has(u.get("id"))) || users
        return (
            <Col
                className="daygroup"
                style={{borderTop: "solid #eee 1px", borderRight: "solid #ccc 1px"}}
                md={1}>
                {editable && unselected && unselected.size && <UserDropdown
                    users={unselected}
                    date={date}
                    groupId={groupId}/> || false}
                {selected}
            </Col>
        )
    }
}

class User extends React.Component {
    constructor(props) {
        super(props)
        this.state = Object.assign({}, props, {commentState: app.const.show.addButton})
        app.on.userCommentClicked.add( () => this.updateCommentState(app.const.show.addButton, null))
        app.on.editableSet.add(value => this.setState({editable: value}))
    }
    updateCommentState(value, text) {
        this.setState({commentState: value, newComment: text || ""})
    }
    updateComment(event) {
        this.setState({newComment: event.target.value})
    }
    componentDidUpdate() {
        var elem = ReactDOM.findDOMNode(this.refs.comment)
        elem && elem.focus()
    }
    saveComment() {
        var s = this.state;
        this.setState({commentState: app.const.show.addButton, comment: s.newComment})
        app.on.saveUserCommentClicked.dispatch(s.date, s.groupId, s.user.get("id"), s.newComment)
    }
    render() {
        var {user, groupId, date, comment, commentState, editable} = this.state,
            userId = user.get("id"),
            displayOnly = commentState == app.const.show.addButton;
        return (
            <div
                className="user"
                style={{whiteSpace: "nowrap", overflow: "hidden", fontSize: 11}}>
                {editable && (<i
                        style={{marginRight: 3}}
                        className="delete fa fa-times"
                        onClick={app.on.userClicked.dispatch.bind(null, date, groupId, userId, false)}>
                    </i>) || false}
                {editable && displayOnly && (
                    <i
                        style={{marginRight: 3}}
                        className="comment fa fa-pencil-square-o"
                        onClick={this.updateCommentState.bind(this, app.const.show.editEntry, comment)}>
                    </i>) || false}
                {user.get("name")}
                {comment && (displayOnly || !editable) && <div style={{fontStyle: "italic"}}>{comment}</div> || null}
                {editable && this.state.commentState == app.const.show.editEntry && (
                    <div>
                        <input
                            style={{width: "100%"}}
                            ref="comment"
                            defaultValue={this.state.newComment}
                            onBlur={this.saveComment.bind(this)}
                            onChange={this.updateComment.bind(this)}/>
                    </div>
                )}
            </div>
        )
    }
}
