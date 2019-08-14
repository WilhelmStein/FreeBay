import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';

import "../style/Admin.scss";

class AdminPage extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            options: ["Active Users", "Support"],
            active: 0
        }

        autoBind(this)
    }

    componentDidMount()
    {
        if (!this.props.user || !this.props.user.admin)
        {
            this.props.history.push("/");
        }
    }

    actionChange(index)
    {
        this.setState({
            active: index
        })
    }

    render()
    {
        let toDisplay = null;
        if (this.state.active === 0)
            toDisplay = <Users user={this.props.user}/>;
        

        return (
            <div className="AdminPage">
                <Grid container spacing={3}>
                    <Grid item xs={2}>
                        <Dashboard options={this.state.options} active={this.state.active} onClick={this.actionChange}/>
                    </Grid>
                    <Grid item xs={10}>
                        {toDisplay}
                    </Grid>
                </Grid>
            </div>
        )
    }
}

function Dashboard(props)
{

    const options = props.options.map( (item, index) => {
        return (
            <ListItem button className={`ListItem ${props.active === index ? "active" : ""}`} onClick={() => {props.onClick(index);} }>
                <ListItemText primary={item} className="ListItemText"/>
            </ListItem>
        )
    })

    return (
        <Paper className="Dashboard Paper">
            <AppBar position="sticky">
                <Toolbar className="DashboardToolbar">
                    <Typography className="DashboardTitle" variant="h6" noWrap>
                        Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <List className="List">
                {options}
            </List>
        </Paper>
    )
}

class Users extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            display: [],
            users: [],
            page: 0,
            rowsPerPage: 10,
            sort: "Status"
        }

        autoBind(this);
    }

    componentDidMount()
    {
        axios.post('/api/admin/users', {username: this.props.user.Username, password: this.props.user.Password})
        .then( res => {

            if (res.data.error)
            {
                console.error(res.data.message)
            }

            let display = res.data.data
            for (let i = 0; i < res.data.data.length; i++)
            {
                display[i].index = i;
            }

            this.setState({
                display: display,
                users: res.data.data
            })
        })
        .catch( err => {console.error(err);})
    }

    validateUser(user, index)
    {
        axios.post('/api/admin/validate', {username: this.props.user.Username, password: this.props.user.Password, user: user.Username})
        .then( res => {
            
            if (res.data.error)
            {
                alert(res.data.message);
                console.error(res.data.message);
                return;
            }

            const users = this.state.users;
            users[this.state.display[index].index].Validated = true;

            const display = this.state.display;
            display[index].Validated = true;

            this.setState({
                users: users,
                display: display
            })
        })
        .catch( err => {console.error(err);})
    }

    rejectUser(user, index)
    {
        console.log(user)
    }

    searchChange(event)
    {
        let display = []
        for (let i = 0 ; i < this.state.users.length; i++)
        {
            let user = this.state.users[i];
            user.index = i;

            if (user.Username.includes(event.target.value)) 
                display.push(user)
        }

        this.setState({
            display: display
        })
    }

    sort(event)
    {
        this.setState({
            sort: event.target.value
        })
    }

    handleChangePage(event, newPage) {
        this.setState({
            page: newPage
        })
    }
    
    handleChangeRowsPerPage(event) {
        this.setState({
            rowsPerPage: +event.target.value,
            page: 0
        })
    }

    render()
    {
        const cell = (content, align, className="") => {
            return (
                <TableCell className={`TableCell ${className}`} align={align}>
                    {content}
                </TableCell>
            )
        }

        const compString = (s1, s2) => {
            const s1u = s1.toUpperCase();
            const s2u = s2.toUpperCase();

            if (s1u < s2u) {
                return -1;
            }
            if (s1u > s2u) {
                return 1;
            }

            return 0;
        }

        const cells = this.state.display
        .sort( (a, b) => {
            switch(this.state.sort)
            {
                case "Username":
                   return compString(a.Username, b.Username);
                case "Name":
                    return compString(a.Username, b.Name);
                case "Surname":
                    return compString(a.Username, b.Surname);
                case "Status":
                    if (a.Validated) return -1;
                    if (b.Validated) return 1;
                    return 0;
                default: return 0;
            }
        })
        .slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
        .map( (user, index) => {
            const status = user.Validated === true ? "Validated \u2713" :
            (   
                <Box>
                    <Button variant='contained' className="Validate Button" onClick={() => this.validateUser(user, index)}>
                        Validate
                    </Button>
                    <Button variant='contained' className="Reject Button" onClick={() => this.rejectUser(user, index)}>
                        Reject
                    </Button>
                </Box>
            )

            const oddity = index % 2 === 1 ? "odd" : "even";

            return (
                <TableRow className={`TableRow ${oddity}`} key={user.Username}>
                    {cell(user.Username, 'left')}
                    {cell(user.Email, 'left')}
                    {cell(user.Name, 'left')}
                    {cell(user.Surname, 'left')}
                    {cell(user.Phone, 'left')}
                    {cell(status, 'left')}
                </TableRow>
            )
        })
        
        return (
            <Paper className="Users Paper">
                <AppBar position="sticky">
                    <Toolbar className="TableToolbar">
                        <Typography className="TableTitle" variant="h6" noWrap>
                            Active Users
                        </Typography>

                        <InputBase
                            placeholder="Search…"
                            className="TableSearch"
                            inputProps={{ 'aria-label': 'search' }}
                            onChange={this.searchChange}
                        />
                        <Box className="Sort">
                            <span>
                                Sort By:
                                <Select 
                                    className="Select" value={this.state.sort} 
                                    onChange={this.sort} 
                                    input={<InputBase className="TableSearch"/>}
                                >
                                    <MenuItem value="Username">Username</MenuItem>
                                    <MenuItem value="Name">First Name</MenuItem>
                                    <MenuItem value="Surname">Surname</MenuItem>
                                    <MenuItem value="Status" >Status</MenuItem>
                                </Select>
                            </span>
                        </Box>
                        

                        <TablePagination
                            className="Pagination"
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={this.state.display.length}
                            rowsPerPage={this.state.rowsPerPage}
                            page={this.state.page}
                            backIconButtonProps={{
                                'aria-label': 'previous page',
                            }}
                            nextIconButtonProps={{
                                'aria-label': 'next page',
                            }}
                            onChangePage={this.handleChangePage}
                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                        />
                    </Toolbar>
                </AppBar>
                <Table className="Table">
                    <TableHead className="TableHead">
                        <TableRow>
                            {cell('Username', 'left')}
                            {cell('Email', 'left')}
                            {cell('Name', 'left')}
                            {cell('Surname', 'left')}
                            {cell('Phone', 'left')}
                            {cell('Status', 'left')}
                        </TableRow>
                    </TableHead>
                    <TableBody className="TableBody">
                        {cells}
                    </TableBody>
                </Table>          
            </Paper>
        )
    }
}



export default withRouter(AdminPage);