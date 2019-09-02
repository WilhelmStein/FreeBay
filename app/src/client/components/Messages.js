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
            editor: false
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
        if (!props.reply)
        {
            props.reply = false
        }

        this.setState({
            editor: true,
            editorProps: props
        })
    }

    render()
    {
        return (
            <Grid container className="Messages">
                <MessageList user={this.props.user} messageClick={this.changeActive} userClick={this.userClick} newMessage={this.newMessage}/>
                {
                    this.state.editor ?
                    <MessageEditor user={this.props.user} {...this.state.editorProps}/>
                    :
                    <MessageRenderer active={this.state.active} userClick={this.userClick} reply={this.newMessage}/>
                }
            </Grid>
        );
    }
}

let userColorDex = {};

class MessageList extends Component
{
    constructor(props)
    {
        super(props);
        
        this.state = {
            headers: [],
            messages: [],
            display: [],
            displayType: "Received"
        }
        autoBind(this);
    }

    componentDidMount()
    {
        if (!(this.props.user)) return;

        axios.post("/api/messages", {username: this.props.user.Username, password: this.props.user.Password})
        .then((res) => {

            if (res.data.error)
            {
                console.error(res.data.message)
                return;
            }

            const withHistory = res.data.data.map( header => {
                header.Messages = header.Messages.map( (message) => {

                    if ( ! userColorDex.hasOwnProperty(message[this.state.displayType ? "Sender" : "Receiver"]) )
                    {
                        userColorDex[message[this.state.displayType ? "Sender" : "Receiver"]] = getRandomColor();
                    }

                    message.color = userColorDex[message[this.state.displayType ? "Sender" : "Receiver"]];

                    message.History = this.history(header, message);
                    return message;
                })

                return header;
            })
            const messageArrays = withHistory.map(h => h.Messages)
            const messages = [].concat.apply([], messageArrays);
            const display = this.getMessagesByType(messages, this.state.displayType);

            this.setState({
                headers: res.data.data,
                messages: messages,
                display: display
            })
        })
        .catch(err => console.error(err))
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
        const ret = header.Messages.reverse().filter( (m) => {
            if (new Date(m.Time) >= new Date(message.Time)) return false;
            return true;
        })

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
        const items = this.state.display.map( (message, index) => {
            const oddity = index % 2 === 0 ? "even" : "odd"
            return (
                <Fade in={true} key={message.Id}>
                    <ListItem  className={`ListItem ${oddity}`} onClick={(e) => {this.props.messageClick(e, message)}}>
                        <Card className="MessageCard">
                            <CardHeader
                                className="CardHeader"
                                avatar={
                                    <Avatar 
                                        className="Avatar" 
                                        style={{backgroundColor: message.color}} 
                                        title={this.state.displayType === "Received" ? message.Sender : message.Receiver} 
                                        onClick={(e) => { this.props.userClick(e, this.state.displayType === "Received" ? message.Sender : message.Receiver); }}
                                    >
                                        {this.state.displayType === "Received" ? message.Sender.toUpperCase()[0] : message.Receiver.toUpperCase()[0]}
                                    </Avatar>
                                }
                                title={message.Subject}
                                subheader={new Date(message.Time).toDateString()}                  
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
                                onClick={(e) => {this.newMessage(e, {})}}
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
                                        style={{backgroundColor: m.color}} 
                                        title={m.Sender} 
                                        onClick={(e) => { this.props.userClick(e, m.Sender); }}
                                    >
                                        {m.Sender.toUpperCase()[0]}
                                    </Avatar>
                                }
                                title={m.Subject}
                                subheader={new Date(m.Time).toDateString()}                  
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
                            <Button className={`Delete Button ${!this.props.active ? " disabled" : ""}`} variant="contained" color="secondary" disabled={!this.props.active}>
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
            prev: this.props.prev,
            text: "",
            usernames: [],
        }
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
            to: event.target.to
        })
    }

    send()
    {
        if (this.state.text === "") 
        {
            this.setState({
                textError: true
            })
        }
        if (!this.state.to)
        {
            this.setState({
                toError: true
            })
        }
        if (!this.state.subject)
        {
            this.setState({
                subjectError: true
            })
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
                return;
            }
        })
        .catch(err => console.error(err))
    }

    toOnBlur(event)
    {
        if (event.target.value !== "")
        {
            this.setState({
                toError: false
            })
        }
        else
        {
            this.setState({
                toError: true
            })
        }
    }

    subjectOnBlur(event)
    {
        if (event.target.value !== "")
        {
            this.setState({
                subjectError: false
            })
        }
        else
        {
            this.setState({
                subjectError: true
            })
        }
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
                                    error={this.state.toError}
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
                                    error={this.state.subjectError}
                                    value={this.state.subject}
                                    onChange={this.changeSubject}
                                    onBlur={this.subjectOnBlur}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Subject:</InputAdornment>
                                    }}
                                />
                            </div>
                            <Card className="New Message" raised>
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
                                    title={this.state.subject}
                                    subheader={new Date().toDateString()}                  
                                />
                                <CardContent>
                                    <InputBase
                                        className="Input"
                                        value={this.state.text}
                                        onChange={this.write}
                                        placeholder="Type here..."
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