import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom'
import autoBind from 'auto-bind';
import axios from "axios"

import LoginPopup from './LoginPopup';
import Logo from '../images/Logo2.png';

import SearchIcon from '@material-ui/icons/Search'
import {Button, Box, Avatar, Typography} from '@material-ui/core'

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
        this.props.history.push(`/user/${this.props.user.Username}`);
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
                <AccountSnapshot user={this.props.user} loginHandler={this.props.loginHandler} userClick={this.userClick}/>
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
                    <SearchIcon fontSize="medium"/>
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
                name: "Messages",
                path: "/messages"
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

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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
                        <Avatar style={{backgroundColor: this.getRandomColor()}} className="Avatar" onClick={this.props.userClick}>{this.props.user.Username[0]}</Avatar>
                        <Box>
                            <Typography className="Username" onClick={this.props.userClick}>
                                {this.props.user.Username}
                            </Typography>
                            <Typography
                                className="Logout"
                                onClick={() => { sessionStorage.removeItem("LoggedUser"); this.props.loginHandler(null); }}
                            >
                                Log Out
                            </Typography>
                        </Box>
                </div>
            )
        }
    }
}

export default withRouter(Header);