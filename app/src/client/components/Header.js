import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import autoBind from 'auto-bind';
import axios from "axios"

import LoginPopup from './LoginPopup';
import Logo from '../images/Logo2.png';

import "../style/Header.scss"
import SearchImg from "../images/Search.png"

export default class Header extends Component
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
                <SearchBar/>
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
        axios.post("/api/search", {
            category: this.state.categories[this.state.category].Id,
            text: this.state.text
        })
        .then(res => {
            // Get results and load them
        })
        .catch(err => console.log(err));

        console.log(`Category: ${this.state.categories[this.state.category].Name}, Text: ${this.state.text}`);

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
                <button type="submit" onClick={this.submit}>
                    <img alt="" src={SearchImg}/>
                </button>
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
                <LoginPopup loginHandler={props.loginHandler}/>
                &nbsp;
                |
                &nbsp;
                <Link to="/signup" className="link" id="Signup">
                    Sign Up
                </Link>
            </div>
        )
    }
    else
    {
        return (
            <div className="AccountSnapshot AccountSnapshotFull">
                Welcome, {props.user.Username}!
                <button onClick={() => { sessionStorage.removeItem("LoggedUser"); props.loginHandler(null); }}>
                    Log out
                </button>
            </div>
        )
    }
}