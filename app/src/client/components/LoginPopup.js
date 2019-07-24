import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import axios from "axios"
import autoBind from 'auto-bind';

import "../style/LoginPopup.scss"

export default class LoginPopup extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {};
    }

    render()
    {
        return (
            <Popup  
                className="LoginPopup"
                modal
                trigger={
                    <button className='link' id="Login">Log in</button>
                }
            >
                {
                    close => (
                        <LoginForm signupRedirect={this.props.signupRedirect} Close={close} loginHandler={this.props.loginHandler}/>
                    )
                }
            </Popup>
        )
    }
}

export class LoginForm extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            username: "",
            password: "",
            wrong: false
        };

        autoBind(this);
    }

    usernameChange(event)
    {
        this.setState({
            username: event.target.value
        })
    }

    passwordChange(event)
    {
        this.setState({
            password: event.target.value
        })
    }

    submit(event)
    {
        axios.post('/api/login', {
            username: this.state.username,
            password: this.state.password
        })
        .then(res => {
            
            console.log(res.data);

            if (res.data.error)
            {
                this.setState({
                    username: this.state.username,
                    password: this.state.password,
                    wrong: true
                })
            }
            else
            {
                this.props.Close();

                sessionStorage.setItem('LoggedUser', JSON.stringify(res.data.data));

                if (this.props.loginHandler)
                {
                    this.props.loginHandler(res.data.data)
                }
            }
            
        })
        .catch(err => console.log(err));

        event.preventDefault();
    }

    render()
    {
        const signupPath = this.props.signupRedirect ? `/signup/${this.props.signupRedirect}` : "/signup";
        return (
            <form className='LoginForm' onSubmit={this.submit}>
                <header>Log in</header>
                <label>
                    <p>Username</p>
                    <input 
                        title={this.state.wrong ? 'Wrong Username' : ''}
                        className={this.state.wrong ? 'form-wrong' : 'form-right'}
                        type="text"
                        placeholder="Username"
                        value={this.state.username}
                        onChange={this.usernameChange}
                    />
                </label>

                <label>
                    <p>Password</p>
                    <input 
                        title={this.state.wrong ? 'Wrong Password' : ''}
                        className={this.state.wrong ? 'form-wrong' : 'form-right'}
                        type="password"
                        placeholder="********"
                        value={this.state.password}
                        onChange={this.passwordChange}
                    />
                </label>

                <button id="LoginButton" type="submit">Log in</button>

                <span>
                    New User? &nbsp;
                    <Link to={signupPath} onClick={this.props.Close} className="link">Sign up now!</Link>
                </span>
            </form>
        )
    }
    
}