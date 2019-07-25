import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import axios from "axios"
import autoBind from 'auto-bind';

import "../style/LoginPopup.scss"

export default class LoginPopup extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            login: props.text === "Log In" ? true : false
        };

        autoBind(this);
    }

    loginPress()
    {
        this.setState({
            login: true
        })
    }

    signupPress()
    {
        this.setState({
            login: false
        })
    }

    render()
    {
        return (
            <Popup  
                className="LoginPopup"
                modal
                trigger={
                    <button className='link Login'>{this.props.text}</button>
                }
            >
                {
                    close => (
                        <div className="LoginPopupWrapper">
                            <div className="Buttons">
                                <button onClick={this.loginPress} className={this.state.login ? "active" : ""}>
                                    Log in
                                </button>
                                <button onClick={this.signupPress} className={!this.state.login ? "active" : ""}>
                                    Sign up
                                </button>
                            </div>
                            {
                                this.state.login ? 
                                    <LoginForm Close={close} loginHandler={this.props.loginHandler}/>
                                    :
                                    <SignupForm Close={close} loginHandler={this.props.loginHandler}/>
                            }
                        </div>
                        
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
        return (
            <form className='LoginForm' onSubmit={this.submit}>
                <header>Log in</header>
                    <div className="label">
                        <p>Username</p>
                        <input 
                            title={this.state.wrong ? 'Wrong Username' : ''}
                            className={this.state.wrong ? 'form-wrong' : 'form-right'}
                            type="text"
                            placeholder="example69"
                            value={this.state.username}
                            onChange={this.usernameChange}
                        />
                    </div>

                    <div className="label">
                        <p>Password</p>
                        <input 
                            title={this.state.wrong ? 'Wrong Password' : ''}
                            className={this.state.wrong ? 'form-wrong' : 'form-right'}
                            type="password"
                            placeholder="********"
                            value={this.state.password}
                            onChange={this.passwordChange}
                        />
                    </div>

                <button id="LoginButton" type="submit">Log in</button>
            </form>
        )
    }
    
}

export class SignupForm extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            username: "",
            password: "",
            repassword: "",
            email: "",
            name: "",
            surname: "",
            phone: "",
            street: "",
            number: "",
            zipcode: "",
            city: "",
            country: "",
            countries: []
        }

        this.data = [
            [
                {name: "username", type: "text", label: "Username", placeholder: "example69",},
                {name: "password", type: "password", label: "Password", placeholder: "********"},
                {name: "repassword", type: "password", label: "Confirm Password", placeholder: "********"},
                {name: "email", type: "text", label: "E-mail", placeholder: "example@ex.com"},
                {name: "name", type: "text", label: "First name", placeholder: "Diego"},
                {name: "surname", type: "text", label: "Surname", placeholder: "Costa"}
            ],
            [
                {name: "phone", type: "number", label: "Contact Phone", placeholder: "1234567890"},
                {name: "street", type: "text", label: "Street", placeholder: "Knossou"},
                {name: "number", type: "text", label: "Number", placeholder: "50"},
                {name: "zipcode", type: "text", label: "Zip-Code", placeholder: "12345"},
                {name: "city", type: "text", label: "City", placeholder: "Athens"},
                {name: "country", type: "text", label: "Country", placeholder: "Greece"}
            ]
        ]
    }

    componentDidMount()
    {
        axios.get("https://restcountries.eu/rest/v2/all")
        .then(res => {
            const countries = res.data.map( (country) => {
                return country.name;
            })

            this.setState({
                countries: countries
            })
        })
        .catch(err => console.error(err))

        autoBind(this);
    }

    _empty(name)
    {
        return this.state[name] === ""
    }

    change(event, name)
    {
        let newState = this.state;
        newState[name] = event.target.value;

        this.setState(newState);
    }

    blur(event, name)
    {
        if (name === 'password' || name === 'repassword') return this.confirmPasswordCheck();
        if (name === 'username') return this.usernameCheck();
        if (name === 'email') return this.emailCheck();
    }

    usernameCheck(username)
    {
        axios.post('/api/username', {
            username: this.state.username,
        })
        .then(res => {
            if (res.data.error) {
                console.error(res.data.message);
                return;
            }

            if (res.data.data.length > 0)
            {
                this.setState({
                    usernameError: "Username already exists.",
                })
            }
            else
            {
                this.setState({
                    usernameError: undefined
                })
            }
        })
        .catch(err => console.error(err))
    }

    confirmPasswordCheck(password)
    {
        if (this.state.password !== this.state.repassword)
        {
            this.setState({
                passwordError: "Passwords do not match.",
                repasswordError: "Passwords do not match."
            })
        }
        else
        {
            this.setState({
                passwordError: undefined,
                repasswordError: undefined
            })
        }
    }

    emailCheck(email)
    {
        axios.post('/api/email', {
            email: this.state.email,
        })
        .then(res => {
            if (res.data.error) {
                console.error(res.data.message);
                return;
            }

            if (res.data.data.length > 0)
            {
                this.setState({
                    emailError: "E-mail already exists.",
                })
            }
            else
            {
                this.setState({
                    emailError: undefined
                })
            }
        })
        .catch(err => console.error(err))
    }

    submit(event)
    {
        if (this.state.usernameError ||
            this.state.passwordError ||
            this.state.repasswordError ||
            this.state.emailError)
        {
            alert("Please fix all errors.");
            return;
        }

        if (this._empty("username") ||
            this._empty("password") ||
            this._empty("repassword") ||
            this._empty("email") ||
            this._empty("name") ||
            this._empty("surname") ||
            this._empty("phone") ||
            this._empty("street") ||
            this._empty("number") ||
            this._empty("zipcode") ||
            this._empty("city") ||
            this._empty("country"))
        {
            // alert("Please fill all fields.");
            return;
        }

        axios.post('/api/signup', {
            username: this.state.username,
            password: this.state.password,
            email: this.state.email,
            name: this.state.name,
            surname: this.state.surname,
            phone: this.state.phone,
            street: this.state.street,
            number: this.state.number,
            zipcode: this.state.zipcode,
            city: this.state.city,
            country: this.state.country,
        })
        .then(res => {
            if (res.data.error) {
                console.error(res.data.message);
                alert(res.data.message);
                return;
            }

            console.log(res.data)

            this.props.Close();

            sessionStorage.setItem('LoggedUser', JSON.stringify(res.data.data));

            if (this.props.loginHandler)
            {
                this.props.loginHandler(res.data.data)
            }
            
        })
        .catch(err => console.error(err))

        event.preventDefault();
    }

    render()
    {
        const options = this.data.map( (menu, index) => {
            
            const suboptions = menu.map( (item, index2) => {
                if (item.name === "country")
                {
                    const countries = this.state.countries.map( (country) => {
                        return <option key={country} value={country}>
                            {country}
                        </option>
                    })

                    return (
                        <div className="label" key={`${item.name}_label`}>
                            <p>{item.label}</p>
                            <select 
                                key={item.name}
                                onChange={ (e) => {this.change(e, item.name); } }
                            >
                                {countries}
                            </select>
                        </div>
                    )
                }

                return (
                    <div className="label" key={`${item.name}_label`}>
                        <p>{item.label}</p>
                        <input 
                            key={item.name}
                            title={this.state[`${item.name}Error`]}
                            className={this.state[`${item.name}Error`] ? 'form-wrong' : 'form-right'}
                            value={this.state[item.name]}
                            placeholder={item.placeholder}
                            type={item.type}
                            onBlur={(e) => this.blur(e, item.name)}
                            onChange={ (e) => {this.change(e, item.name); } }
                        />
                    </div>
                )
            })

            return (
                <div key={`menu${index}`}>
                    {suboptions}
                </div>
            )
        });

        return (
            <form className='SignupForm' onSubmit={this.submit}>
                <header>Sign up</header>
                <div className="Labels">
                    {options}
                </div>
                <button id="SignupButton" type="submit">Sign up</button>
            </form>
        )
    }
}