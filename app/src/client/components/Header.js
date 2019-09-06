import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom'
import autoBind from 'auto-bind';
import axios from "axios"
import {getRandomColor} from "./Utils"

import LoginPopup from './LoginPopup';
import Logo from '../images/Logo2.png';

import SearchIcon from '@material-ui/icons/Search'
import {Button, Avatar, Typography, IconButton, Badge, Paper, Card, CardHeader, Fade} from '@material-ui/core'
import MailIcon from '@material-ui/icons/Mail'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'

import Popup from 'reactjs-popup';

import "../style/Header.scss"

class Header extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            user: this.props.user
        }

        autoBind(this);
    }

    userClick()
    {
        if (this.props.user.admin)
        {
            this.props.history.push('/admin');
            return;
        }

        this.props.history.push(`/user/${this.props.user.Username}`);
    }

    notificationClick(link)
    {
        this.props.history.push(link);
    }


    render()
    {
        return (
            <div className="Header">
                <Link to='/' id="Logo" className="link">
                    <img alt="" src={Logo}/>
                    <p>FreeBay</p>
                </Link>
                <SearchBar history={this.props.history}/>
                <AccountSnapshot user={this.props.user} loginHandler={this.props.loginHandler} userClick={this.userClick} notificationClick={this.notificationClick}/>
            </div>
        );
    }
}

class SearchBar extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            text: "",
            categories: [{Id: 0, Name: "All"}],
            category: 0
        }

        autoBind(this);
    }

    componentDidMount()
    {
        axios.get("/api/categories")
        .then(res => {
            if (res.data.error)
            {
                console.error(res.message);
            }
            else
            {
                let categories = this.state.categories;
                for(let i = 0; i < res.data.data.length; i++)
                {
                    categories.push(res.data.data[i]);
                }

                this.setState({
                    categories: categories
                })
            }
        })
        .catch(err => console.log(err));
    }

    inputChange(event)
    {
        this.setState({
            text: event.target.value
        })
    }

    categoryChange(event)
    {
        this.setState({
            category: event.target.value
        })
    }

    submit(event)
    {  
        this.props.history.push(`/search?category={${this.state.categories[this.state.category].Id}}&text={${this.state.text}}`);

        event.preventDefault();
    }

    render()
    {
        const categories = this.state.categories.map((category, index) => {
            return <option key={category.Id} value={index}>{category.Name}</option>
        })

        return (
            <div className="SearchBar">
                <select onChange={this.categoryChange}>
                    {categories}
                </select>
                <input placeholder="Search..." value={this.state.text} onChange={this.inputChange}/>
                <Button color="secondary"  variant="contained" type="submit" aria-label="search" onClick={this.submit}>
                    <SearchIcon/>
                </Button>
            </div>
        )
    }
}

export class Menu extends Component
{
    constructor(props)
    {
        super(props);
        autoBind(this);
    }

    render()
    {
        const paths = [
            {
                name: "Home",
                path: "/"
            },
            {
                name: "Account",
                path: "/account"
            },
            {
                name: "My Auctions",
                path: "/myauctions"
            },
            {
                name: "About Us",
                path: "/about"
            },
            {
                name: "Help",
                path: "/help"
            }
        ]

        const buttons = paths.map( (item, index) => {
            return <Button component={Link} variant="contained" className={`Button ${this.props.active === item.path ? "active" : "inactive"}`} key={item.name} to={item.path}>{item.name}</Button>
        })

        return (
            <div className="Menu">
                {buttons}
            </div>
        ) 
    }
}

class AccountSnapshot extends Component
{
    constructor(props)
    {
        super(props);
        
        this.state = {
            open: false,
            tab: null
        }

        autoBind(this);
    }

    open(event)
    {
        this.setState({
            open: true,
            tab: event.target.innerHTML
        })
    }

    close(event)
    {
        this.setState({
            open: false,
            tab: null
        })
    }


    render()
    {
        if (this.props.user === null)
        {
            return (
                <div className="AccountSnapshot Empty">
                    <button className='link Login' onClick={this.open}>Log In</button>
                    &nbsp;
                    |
                    &nbsp;
                    <button className='link Login' onClick={this.open}>Sign Up</button>

                    <LoginPopup open={this.state.open} close={this.close} tab={this.state.tab} loginHandler={this.props.loginHandler}/>
                </div>
            )
        }
        else
        {
            return (
                <div className="AccountSnapshot Full">
                    <Notifications user={this.props.user} onClick={this.props.notificationClick}/>
                    <IconButton className="Button" onClick={() => { sessionStorage.removeItem("LoggedUser"); this.props.loginHandler(null); }} title="Log Out">
                        <ExitToAppIcon/>
                    </IconButton>
                    <IconButton className="Button" onClick={this.props.userClick}>
                        <Avatar style={{backgroundColor: getRandomColor()}} className="Avatar" >
                            {this.props.user.Username[0]}
                        </Avatar>
                    </IconButton>
                    
                </div>
            )
        }
    }
}

class Notifications extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            notifications: []
        }

        autoBind(this);
    }

    componentDidMount()
    {
        this.getNotifications();
    }

    clickNotification(notification)
    {
        this.props.onClick(notification.Link);

        axios.post('/api/readNotification', {username: this.props.user.Username, password: this.props.user.Password, notification: notification.Id})
        .then( res => {
            if (res.data.error)
            {
                console.error(res.data.message);
                return;
            }

            this.getNotifications();
        })
        .catch(err => console.error(err))
    }

    getNotifications()
    {
        axios.post('/api/notifications', {username: this.props.user.Username, password: this.props.user.Password})
        .then( res => {
            if (res.data.error)
            {
                console.error(res.data.message);
                return;
            }

            this.setState({
                notifications: res.data.data
            })
        })
        .catch( err => console.error(err))
    }

    render()
    {
        let colors = {};
        colors['Message'] = getRandomColor();
        colors['Auction'] = getRandomColor();

        const renderTime = (time) => {

            time = new Date(time);
            if ((Date.now() - time) / (1000 * 60 * 60 * 24) < 0)
            {
                return time.toDateString();
            }
        
            return time.toLocaleTimeString();
        }

        const items = this.state.notifications.map( (not, index) => {
            const oddity = index % 2 === 1 ? "odd" : "even"

            return (
            <Card className={`Notification ${oddity}`} key={not.Id} onClick={() => {this.clickNotification(not)}}>
                <CardHeader
                    avatar={
                        <Avatar className="Avatar" style={{backgroundColor: colors[not.Type]}}>
                            {not.Type[0]}
                        </Avatar>
                    }
                    action={<Typography className="Action">Unread</Typography>}
                    title={not.Content}
                    subheader={renderTime(not.Time)}
                />
            </Card>
            )
        })

        return (
            <Popup
                className="Notifications"
                position="bottom right"
                trigger = {
                    <IconButton className="Button">
                        <Badge badgeContent={this.state.notifications.length} className="Badge" color="primary">
                            <MailIcon/>
                        </Badge>
                    </IconButton>
                }
            >
                <Fade in={true}>
                    <Paper className="Paper">
                        {items.length !== 0 ? items : <Typography className="Empty" color="textSecondary">No new notifications</Typography>}
                    </Paper>
                </Fade>
                
            </Popup>
        )
    }
}

export default withRouter(Header);