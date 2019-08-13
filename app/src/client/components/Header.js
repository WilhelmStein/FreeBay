import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom'
import autoBind from 'auto-bind';
import axios from "axios"

import LoginPopup from './LoginPopup';
import Popup from 'reactjs-popup';
import Logo from '../images/Logo2.png';

import SearchIcon from '@material-ui/icons/Search'
import Button from '@material-ui/core/Button'

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


    render()
    {
        return (
            <div className="Header">
                <Link to='/' id="Logo" className="link">
                    <img alt="" src={Logo}/>
                    <p>FreeBay</p>
                </Link>
                <SearchBar history={this.props.history}/>
                <AccountSnapshot user={this.props.user} loginHandler={this.props.loginHandler}/>
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
                    <SearchIcon fontSize="large"/>
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

function AccountSnapshot(props)
{
    if (props.user === null)
    {
        return (
            <div className="AccountSnapshot AccountSnapshotEmpty">
                <LoginPopup loginHandler={props.loginHandler} text="Log In"/>
                &nbsp;
                |
                &nbsp;
                <LoginPopup loginHandler={props.loginHandler} text="Sign Up"/>
            </div>
        )
    }
    else
    {
        return (
            <div className="AccountSnapshot AccountSnapshotFull">
                <Popup
                    className='AccountPopup'
                    trigger = {open => (
                        <div className="AccountPopupText">
                            Welcome, {props.user.Username} !
                            {
                                open ?
                                <span className="account_button"/>
                                :
                                <span className="account_button_downward"/>
                            }
                        </div>
                    )}
                    position="bottom right"
                >
                    <div className = "AccountMenu">
                        <button onClick={() => {}}>
                            Settings
                        </button>
                        <button onClick={() => { sessionStorage.removeItem("LoggedUser"); props.loginHandler(null); }}>
                            Log out
                        </button>
                    </div>
                </Popup>
            </div>
        )
    }
}

export default withRouter(Header);