import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

import "../style/Admin.scss";

class AdminPage extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            users: [],
            page: 0,
            rowsPerPage: 10
        }

        autoBind(this)
    }

    componentDidMount()
    {
        if (!this.props.user || !this.props.user.admin)
        {
            this.props.history.push("/");
        }

        axios.post('/api/admin/users', {username: this.props.user.Username, password: this.props.user.Password})
        .then( res => {
            console.log(res.data.data);

            if (res.data.error)
            {
                console.error(res.data.message)
            }

            this.setState({
                users: res.data.data
            })
        })
        .catch( err => {console.error(err);})
    }

    validateUser(user)
    {

    }

    rejectUser(user)
    {

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

        const cells = this.state.users.map( user => {
            return (
                <TableRow key={user.Username}>
                    {cell(user.Username, 'left')}
                    {cell(user.Email, 'left')}
                    {cell(user.Name, 'left')}
                    {cell(user.Surname, 'left')}
                    {cell(user.Phone, 'left')}
                    {/* {cell(user.Validated, 'left')} */}
                </TableRow>
            )
        })
        
        return (
            <div className="AdminPage">
                <Table className="Table">
                    <TableHead>
                        <TableRow>
                            {cell('Username', 'left')}
                            {cell('Email', 'left')}
                            {cell('Name', 'left')}
                            {cell('Surname', 'left')}
                            {cell('Phone', 'left')}
                            {cell('Validated', 'left')}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cells}
                    </TableBody>
                </Table>
                {/* <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={this.state.users.length}
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
                /> */}
            </div>
        )
    }
}

export default withRouter(AdminPage);