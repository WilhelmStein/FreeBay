import React, { Component } from 'react';
import autoBind from 'auto-bind';
import axios from 'axios';
import { withRouter } from 'react-router-dom';

import MarkdownRenderer from 'react-markdown-renderer';
import { getRandomColor } from './Header';
import { Grid, Card, CardHeader, Avatar, CardContent, Typography, List, ListItem, AppBar, Toolbar, InputBase, Select, MenuItem, Paper, Fade } from '@material-ui/core';

import "../style/Messages.scss";

class Messages extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            active: null
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
            active: message
        })
    }

    render()
    {
        return (
            <Grid container className="Messages">
                <MessageList user={this.props.user} messageClick={this.changeActive} userClick={this.userClick}/>
                <MessageRenderer active={this.state.active}/>
            </Grid>
        );
    }
}

class MessageList extends Component
{
    constructor(props)
    {
        super(props);
        
        this.state = {
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

            for (var type in res.data.data)
            {
                if (res.data.data.hasOwnProperty(type))
                {
                    const messages = res.data.data[type].map( (message) => {
                        message.color = getRandomColor();
                        return message;
                    })

                    res.data.data[type] = messages;
                }
            }
            
            this.setState({
                messages: res.data.data,
                display: res.data.data[this.state.displayType]
            })
        })
        .catch(err => console.error(err))
    }

    changeDisplayType(event)
    {
        this.setState({
            displayType: event.target.value,
            display: this.state.messages[event.target.value]
        })
    }

    searchChange(event)
    {
        let display = []
        for (let i = 0 ; i < this.state.messages[this.state.displayType].length; i++)
        {
            let message = this.state.messages[this.state.displayType][i];
            
            console.log(message.Subject + " " + event.target.value)
            if (message.Subject.toLowerCase().includes(event.target.value.toLowerCase()))
            {
                display.push(message)
            }
                
        }

        this.setState({
            display: display
        })
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
                                    <MenuItem value="Conversations">Conversations</MenuItem>
                            </Select>
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
        return (
            <Grid item xs={9}>
                <Paper className="MessageRenderer Paper">
                    <AppBar position="sticky">
                        <Toolbar className="Toolbar">

                        </Toolbar>
                    </AppBar>
                    {/* <Typography> */}
                        <MarkdownRenderer markdown={this.props.active ? this.props.active.Body : "# hello"}/>
                    {/* </Typography> */}
                </Paper>
            </Grid>
        )
    }
}

export default withRouter(Messages);