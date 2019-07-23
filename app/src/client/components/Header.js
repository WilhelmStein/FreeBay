import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import autoBind from 'auto-bind';

import LoginPopup from './LoginPopup';
// import logo from '../images/Logo.png';

import "../style/Header.scss"

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
                    FreeBay
                </Link>
                <AccountSnapshot user={this.props.user} loginHandler={this.props.loginHandler}/>
            </div>
        );
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
}