import React, { Component } from 'react';
import autoBind from 'auto-bind';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';

import MarkdownRenderer from 'react-markdown-renderer';
import { getRandomColor } from './Header';
import { Card, CardHeader, Avatar, CardContent, AppBar, Toolbar, Select, MenuItem, InputAdornment } from '@material-ui/core';
import { Box, Grid, Typography, InputBase, Paper, Fade, List, ListItem, Button, IconButton, TextField } from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';
import ReplyIcon from '@material-ui/icons/Reply';
import SendIcon from '@material-ui/icons/Send'
import AddCommentIcon from '@material-ui/icons/AddComment';

import "../style/Messages.scss";

class Messages extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            active: null,
            editor: false,
            editorProps: {
                to: "",
                subject: "",
                prev: [],
                reply: false
            },
            messages: []
        }

        autoBind(this);
    }

    userClick(event, user)
    {
        this.props.history.push(`/user/${user}`);
    }

    changeActive(event, message)
    {
        this.setState({
            active: message,
            editor: false
        })
    }

    newMessage(props)
    {
        if (props === null || props === undefined)
        {
            props = {
                to: "",
                subject: "",
                history: [],
                reply: false
            }
        }

        if (!props.reply)
        {
            props.reply = false
        }

        this.setState({
            editor: true,
            editorProps: props
        })
    }

    sendMessage()
    {
        console.log("hi")
        this.setState({
            editor: true,
            editorProps: {
                to: "",
                subject: "",
                history: [],
                reply: false
            }
        })

        this.getMessages();
    }

    deleteMessage()
    {
        this.getMessages();
    }

    componentDidMount()
    {
        this.getMessages();
    }

    getMessages()
    {
        axios.post("/api/messages", {username: this.props.user.Username, password: this.props.user.Password})
        .then((res) => {

            if (res.data.error)
            {
                console.error(res.data.message)
                return;
            }

            this.setState({
                messages: res.data.data
            })
        })
        .catch(err => console.error(err));
    }

    render()
    {
        return (
            <Grid container className="Messages">
                <MessageList user={this.props.user} messages={this.state.messages} messageClick={this.changeActive} userClick={this.userClick} newMessage={this.newMessage}/>
                {
                    this.state.editor ?
                    <MessageEditor user={this.props.user} {...this.state.editorProps} send={this.sendMessage}/>
                    :
                    <MessageRenderer active={this.state.active} userClick={this.userClick} reply={this.newMessage} delete={this.deleteMessage}/>
                }
            </Grid>
        );
    }
}

let userColorDex = {};
const renderTime = (time) => {

    time = new Date(time);
    if ((Date.now() - time) / (1000 * 60 * 60 * 24) < 0)
    {
        return time.toDateString();
    }

    return time.toLocaleTimeString();
}

class MessageList extends Component
{
    constructor(props)
    {
        super(props);
        
        this.state = {
            propMessages: this.props.messages,
            messages: [],
            display: [],
            displayType: "Received"
        }
        autoBind(this);
    }

    componentDidMount()
    {
        if (!(this.props.user)) return;

        this.processMessages();
    }

    componentWillReceiveProps(nextProps)
    {
        this.processMessages(nextProps);
    }

    processMessages(props=this.props)
    {
        console.log("hi")
        const arraysWithHistory = props.messages.map( header => {
            header.Messages = header.Messages.map( (message) => {

                const user = message[this.state.displayType === "Received" ? "Sender" : "Receiver"];

                if ( ! userColorDex.hasOwnProperty(user) )
                {
                    userColorDex[user] = getRandomColor();
                }

                message.History = this.history(header, message);
                return message;
            })

            return header.Messages;
        })
        
        const messages = [].concat.apply([], arraysWithHistory);
        const display = this.getMessagesByType(messages, this.state.displayType);
        
        this.setState({
            messages: messages,
            display: display
        })
    }

    changeDisplayType(event)
    {
        this.setState({
            displayType: event.target.value,
            display: this.getMessagesByType(this.state.messages, event.target.value)
        })
    }

    history(header, message)
    {
        const ret = header.Messages.filter( (m) => {
            if (new Date(m.Time) >= new Date(message.Time)) return false;
            return true;
        }).reverse();

        return ret;
    }

    getMessagesByType(messages, type)
    {
        const ret = messages.filter( (m) => {

            if (type === "Received" && m.Receiver !== this.props.user.Username) return false;
            if (type === "Sent" && m.Sender !== this.props.user.Username) return false;
            return true;
        })

        return ret;
    }

    searchChange(event)
    {
        const display = this.getMessagesByType(this.state.messages, this.state.displayType).filter( (message) => {
            if (message.Subject.toLowerCase().includes(event.target.value.toLowerCase()))
            {
                return true;
            }
            return false;
        })

        this.setState({
            display: display
        })
    }

    newMessage(event, props)
    {
        this.props.newMessage(props);
    }

    render()
    {
        const items = this.state.display.sort( (a, b) => {
            const atime = new Date(a.Time);
            const btime = new Date(b.Time);

            if (atime < btime) return 1;
            if (atime > btime) return -1;
            return 0;

        }).map( (message, index) => {
            const oddity = index % 2 === 0 ? "even" : "odd"
            const user = this.state.displayType === "Received" ? message.Sender : message.Receiver;

            return (
                <Fade in={true} key={message.Id}>
                    <ListItem  className={`ListItem ${oddity}`} onClick={(e) => {this.props.messageClick(e, message)}}>
                        <Card className="MessageCard">
                            <CardHeader
                                className="CardHeader"
                                avatar={
                                    <Avatar 
                                        className="Avatar" 
                                        style={{backgroundColor: userColorDex[user]}} 
                                        title={user} 
                                        onClick={(e) => { this.props.userClick(e, user)}}
                                    >
                                        {this.state.displayType === "Received" ? user.toUpperCase()[0] : user.toUpperCase()[0]}
                                    </Avatar>
                                }
                                title={
                                    <div>
                                        {
                                            this.state.displayType === "Sent" ?
                                                <Typography display="inline" color="textSecondary">
                                                    {"To: "}
                                                </Typography>
                                                :
                                                null
                                        }
                                        
                                        <Typography display="inline">
                                            {this.state.displayType === "Sent" ? message.Receiver : message.Sender}
                                        </Typography>
                                    </div>
                                }
                                subheader={message.Subject}
                                action={
                                    <Typography color="textSecondary" className="Time">
                                        {renderTime(message.Time)}
                                    </Typography>
                                    
                                }
                            />
                            <CardContent className="CardContent">
                                <Typography variant="body2" color="textSecondary">
                                    {message.Body.substring(0, 40) + "..."}
                                </Typography>
                            </CardContent>
                        </Card>
                    </ListItem>
                </Fade>
            )
        })

        return (
            <Grid item xs={3}>
                <Paper className="MessageListWrapper Paper Scrollbar">
                    <AppBar position="sticky">
                        <Toolbar className="Toolbar">
                            <div style={{flexGrow: 1}}>
                                <InputBase
                                    placeholder="Search…"
                                    className="Search"
                                    inputProps={{ 'aria-label': 'search' }}
                                    onChange={this.searchChange}
                                />
                                <Select 
                                        className="Select"
                                        value={this.state.displayType} 
                                        onChange={this.changeDisplayType} 
                                        input={<InputBase className="Search"/>}
                                    >
                                        <MenuItem value="Received">Received</MenuItem>
                                        <MenuItem value="Sent">Sent</MenuItem>
                                </Select>
                            </div>
                            <IconButton 
                                className="ComposeMessage Button"
                                variant="contained"
                                title="Compose New Message"
                                onClick={(e) => {this.newMessage(e)}}
                            >
                                <AddCommentIcon/>
                            </IconButton>
                        </Toolbar>
                    </AppBar>

                    <List className="MessageList">
                        {items}
                    </List>

                </Paper>
            </Grid>
        )
    }
}

class MessageRenderer extends Component
{
    constructor(props)
    {
        super(props);
        autoBind(this);
    }

    delete()
    {

    }

    render()
    {
        let items = []

        if (this.props.active)
        {
            items = [this.props.active].concat(this.props.active.History).map( (m) => {
                return (
                    <Fade in key={m.Id}>
                        <Card className="Message" raised>
                            <CardHeader
                                className="CardHeader"
                                avatar={
                                    <Avatar 
                                        className="Avatar" 
                                        style={{backgroundColor: userColorDex[m.Sender]}} 
                                        title={m.Sender} 
                                        onClick={(e) => { this.props.userClick(e, m.Sender); }}
                                    >
                                        {m.Sender.toUpperCase()[0]}
                                    </Avatar>
                                }
                                title={m.Sender}
                                subheader={m.Subject}
                                action={
                                    <Typography color="textSecondary" className="Time">
                                        {renderTime(m.Time)}
                                    </Typography>
                                }
                            />
                            <CardContent>
                                <MarkdownRenderer markdown={m.Body}/>
                            </CardContent>
                        </Card>
                    </Fade>
                )
            })
        }
        
        return (
            <Grid item xs={9}>
                <Paper className="MessageRenderer Paper">
                    <AppBar position="sticky">
                        <Toolbar className="Toolbar">
                            <div style={{flexGrow: 1}}/>
                            <Button
                                className={`Delete Button ${!this.props.active ? " disabled" : ""}`}
                                variant="contained" color="secondary"
                                disabled={!this.props.active}
                                onClick={this.delete}
                            >
                                Delete
                                <DeleteIcon/>
                            </Button>
                            <Button 
                                className={`Reply Button ${!this.props.active ? " disabled" : ""}`}
                                variant="contained"
                                color="primary"
                                disabled={!this.props.active}
                                onClick={ (e) => {this.props.reply({to: this.props.active.Sender, subject: this.props.active.Subject, history: items, reply: this.props.active.Header_Id})}}
                            >
                                Reply
                                <ReplyIcon/>
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <Box className="Messages">
                        {items}
                    </Box>
                </Paper>
            </Grid>
        )
    }
}

class MessageEditor extends Component
{
    constructor(props)
    {
        super(props);
        autoBind(this);

        this.state = {
            to: this.props.to,
            subject: this.props.subject,
            toError: "",
            subjectError: "",
            text: "",
            usernames: [],
        }

        this.inputRef = React.createRef();
    }

    componentDidMount()
    {
        axios.post('/api/usernames', {username: this.props.user.Username, password: this.props.user.Password})
        .then( res => {
            if (res.data.error)
            {
                console.error(res.data.message);
                return;
            }

            this.setState({
                usernames: res.data.data,
            })
        })
        .catch(err => console.error(err))
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({
            to: nextProps.to || "",
            subject: nextProps.subject || "",
            toError: "",
            subjectError: "",
            text: "",
        });
    }

    write(event)
    {
        this.setState({
            text: event.target.value
        })
    }

    changeSubject(event)
    {
        if (this.props.reply) return;

        this.setState({
            subject: event.target.value
        })
    }

    changeRecipient(event)
    {
        if (this.props.reply) return;

        this.setState({
            to: event.target.value
        })
    }

    send()
    {
        if (this.state.text === "") 
        {
            return;
        }
        if (!this.state.to)
        {
            this.setState({
                toError: "Cannot send a message with no recipient"
            })

            return;
        }
        if (!this.state.subject)
        {
            this.setState({
                subjectError: "Cannot send a message with no subject"
            })

            return;
        }

        axios.post('/api/sendMessage', {
            username: this.props.user.Username,
            password: this.props.user.Password,
            recipient: this.state.to,
            subject: this.state.subject,
            text: this.state.text,
            time: Date.now(),
            reply: this.props.reply
        })
        .then( res => {
            
            if (res.data.error)
            {
                console.error(res.data.message);
                if (res.data.message === "User does not exist")
                {
                    this.setState({
                        toError: true
                    })
                }
                return;
            }

            alert("Message successfully sent!");
            this.props.send();
        })
        .catch(err => console.error(err))
    }

    toOnBlur(event)
    {
        if (this.state.to && this.state.to !== "")
        {
            axios.post("/api/username", {username: this.state.to})
            .then( res => {
                if (res.data.error) {
                    console.error(res.data.message);
                    return;
                }
    
                if (res.data.data.length === 0)
                {
                    this.setState({
                        toError: "Username does not exist"
                    })
                }
                else
                {
                    this.setState({
                        toError: ""
                    })
                }
            })
            .catch( err => console.error(err))
        }
        else
        {
            this.setState({
                toError: "Cannot send a message with no recipient"
            })
        }
    }

    subjectOnBlur(event)
    {
        if (this.state.subject !== "")
        {
            this.setState({
                subjectError: ""
            })
        }
        else
        {
            this.setState({
                subjectError: "Cannot send a message with no subject"
            })
        }
    }

    focusInput()
    {
        this.inputRef.current.focus();
    }

    render()
    {
        return (
            <Grid item xs={9}>
                <Paper className="MessageEditor Paper">
                    <AppBar position="sticky">
                        <Toolbar className="Toolbar">
                            <Typography style={{flexGrow: 1}} className="Title">
                                New Message
                            </Typography>
                            <Button className={`Send Button`} variant="contained" onClick={this.send}>
                                Send &nbsp;
                                <SendIcon/>
                            </Button>
                        </Toolbar>
                    </AppBar>

                    <div className="Editor">
                        <div className="NewMessage">
                            <div className="Controls">
                                <TextField 
                                    className="to"
                                    variant="filled"
                                    title={this.state.toError}
                                    error={this.state.toError !== ""}
                                    value={this.state.to}
                                    onChange={this.changeRecipient}
                                    onBlur={this.toOnBlur}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">To:</InputAdornment>
                                    }}
                                />
                                <TextField
                                    className="subject"
                                    variant="filled"
                                    title={this.state.subjectError}
                                    error={this.state.subjectError !== ""}
                                    value={this.state.subject}
                                    onChange={this.changeSubject}
                                    onBlur={this.subjectOnBlur}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Subject:</InputAdornment>
                                    }}
                                />
                            </div>
                            <Card className="New Message" onClick={this.focusInput} raised>
                                <CardHeader
                                    className="CardHeader"
                                    avatar={
                                        <Avatar 
                                            className="Avatar"
                                            style={{backgroundColor: userColorDex.hasOwnProperty([this.props.user.Username]) ? userColorDex[this.props.user.Username] : getRandomColor()}}
                                            title={this.props.user.Username} 
                                            onClick={(e) => { this.props.userClick(e, this.props.user.Username); }}
                                        >
                                            {this.props.user.Username.toUpperCase()[0]}
                                        </Avatar>
                                    }
                                    title={this.props.user.Username}
                                    subheader={this.state.subject}
                                    action={
                                        <Typography color="textSecondary" className="Time">
                                            {new Date().toDateString()}
                                        </Typography>
                                    }              
                                />
                                <CardContent>
                                    <InputBase
                                        className="Input"
                                        value={this.state.text}
                                        onChange={this.write}
                                        placeholder="Type here..."
                                        inputRef={this.inputRef}
                                        multiline
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="Messages">
                            {this.props.history}
                        </div>
                    </div>
                </Paper>
            </Grid>
        )
    }
}

export default withRouter(Messages);