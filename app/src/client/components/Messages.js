import React, { Component } from 'react';
import autoBind from 'auto-bind';
import axios from 'axios';
import { withRouter } from 'react-router-dom';

import { Grid, Card, CardContent, Typography, List, ListItem, AppBar, Toolbar, InputBase, Select, MenuItem } from '@material-ui/core';

import "../style/Messages.scss";

class Messages extends Component
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

    }

    render()
    {
        const items = this.state.display.map( (message) => {
            console.log(message);
            return (
                
                <ListItem key={message.Subject}>
                    <Card className="MessageCard">

                    </Card>
                </ListItem>
            )
        })

        return (
            <Grid container className="Messages">
                <Grid item xs={3}>

                    <div className="MessageList">
                        <AppBar position="sticky">
                            <Toolbar className="MessageList Toolbar">
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
                            </Toolbar>
                        </AppBar>

                        <List>
                            {items}
                        </List>

                    </div>
                    
                </Grid>
                <Grid item xs={9}>

                </Grid>
            </Grid>
        );
    }
}

export default withRouter(Messages);