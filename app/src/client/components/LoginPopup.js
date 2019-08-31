import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import axios from "axios";
import autoBind from 'auto-bind';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';

import "../style/LoginPopup.scss"



export default class LoginPopup extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            tab: props.text === "Log In" ? 0 : 1
        };

        this.tabs = {
            "Log In" : 0,
            "Sign Up" : 1
        }

        autoBind(this);
    }

    tabChange(event, newValue)
    {
        this.setState({
            tab: newValue
        });
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
                            <div className="Tabs">
                                <Tabs
                                    value={this.state.tab}
                                    onChange={this.tabChange}
                                    indicatorColor="primary"
                                    textColor="primary"
                                    centered
                                >
                                    <Tab className="Tab" label="Log In"/>
                                    <Tab className="Tab" label="Sign Up"/>
                                </Tabs>
                            </div>
                            {
                                this.state.tab === this.tabs["Log In"] ? 
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
            
            // console.log(res.data);

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
                //console.log(res.data.data)
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
                    <TextField
                        className="TextField"
                        required
                        error={this.state.wrong}
                        label="Username"
                        value={this.state.username}
                        placeholder="example69"
                        onChange={this.usernameChange}
                        marign="normal"
                        // variant="outlined"
                    />
                    <TextField
                        className="TextField"
                        required
                        error={this.state.wrong}
                        type="password"
                        label="Password"
                        value={this.state.password}
                        placeholder="********"
                        onChange={this.passwordChange}
                        marign="normal"
                        // variant="outlined"
                    />

                <Button variant="contained" id="LoginButton" type="submit">Log in</Button>
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
        const inputField = item => {
            if (item.name !== "country")
            {
                return (
                    <Grid item xs={6} key={`${item.name}TextField`}>
                        <TextField
                            className="TextField"
                            required
                            error={this.state[`${item.name}Error`]}
                            title={this.state[`${item.name}Error`]}
                            label={item.label}
                            value={this.state[item.name]}
                            placeholder={item.placeholder}
                            type={item.type}
                            onChange={ (e) => {this.change(e, item.name); } }
                            onBlur={(e) => this.blur(e, item.name)}
                            marign="normal"
                            // variant="outlined"
                        />
                    </Grid>
                )
            }
            else
            {
                const countries = this.state.countries.map( (country) => {
                    return (
                        <MenuItem value={country} key={country}>
                            {country}
                        </MenuItem>
                    )
                })
                return (
                    <Grid item xs={6} key={`${item.name}TextField`}>
                        <TextField
                            select
                            className="TextField Select"
                            required
                            error={this.state[`${item.name}Error`]}
                            title={this.state[`${item.name}Error`]}
                            label={item.label}
                            value={this.state[item.name]}
                            placeholder={item.placeholder}
                            type={item.type}
                            onChange={ (e) => {this.change(e, item.name); } }
                            onBlur={(e) => this.blur(e, item.name)}
                            marign="normal"
                        >
                            {countries}
                        </TextField>
                    </Grid>
                )
            }
        }

        let options = [];
        for (let i = 0; i < this.data[0].length; i++)
        {
            options.push(inputField(this.data[0][i]));
            options.push(inputField(this.data[1][i]));
        }

        return (
            <form className='SignupForm' onSubmit={this.submit}>
                <header>Sign up</header>
                <Grid container spacing={3} className="Labels">
                    {options}
                </Grid>
                <Button variant="contained" id="SignupButton" type="submit">Sign Up</Button>
            </form>
        )
    }
}