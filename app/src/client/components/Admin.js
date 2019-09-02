import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";


import { Paper, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, Checkbox, DialogContent, DialogContentText } from '@material-ui/core';
import { List, ListItem, ListItemText, Select, MenuItem, AppBar, Toolbar, Dialog, DialogTitle, DialogActions } from '@material-ui/core';
import { Typography, Box, Grid, Button, InputBase } from '@material-ui/core';

import "../style/Admin.scss";

class AdminPage extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            active: "Active Users"
        }

        autoBind(this);

        this.options = ["Active Users", "Export Auctions", "Support"];
        this.optionsMap = {
            "Active Users": <Users user={this.props.user} userClick={this.userClick}/>,
            "Export Auctions": <Auctions user={this.props.user} auctionClick={this.auctionClick} userClick={this.userClick}/>,
            "Support": null
        }
    }

    componentDidMount()
    {
        if (!this.props.user || !this.props.user.admin)
        {
            this.props.history.push("/");
        }
    }

    actionChange(option)
    {
        this.setState({
            active: option
        })
    }

    userClick(event, username)
    {
        this.props.history.push(`/user/${username}`);
    }

    auctionClick(event, id)
    {
        this.props.history.push(`/auction/${id}`);
    }

    render()
    {
        let toDisplay = this.optionsMap[this.state.active];

        return (
            <div className="AdminPage">
                <Grid container spacing={1}>
                    <Grid item xs={2}>
                        <Dashboard options={this.options} active={this.state.active} onClick={this.actionChange}/>
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
            <ListItem button key={item} className={`ListItem ${props.active === item ? "active" : ""}`} onClick={() => {props.onClick(item);} }>
                <ListItemText primary={item} className="ListItemText"/>
            </ListItem>
        )
    })

    return (
        <Paper className="Dashboard Paper">
            <AppBar position="sticky">
                <Toolbar className="DashboardToolbar">
                    <Typography className="DashboardTitle" variant="h6" noWrap>
                        Admin Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <List className="List">
                {options}
            </List>
        </Paper>
    )
}

function __cell(content, align, className="")
{
    return (
        <TableCell className={`TableCell ${className}`} align={align}>
            {content}
        </TableCell>
    )
}

function __compareString(s1, s2)
{
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

function __compareDate(d1, d2)
{
    if (new Date(d1) < new Date(d2)) return -1;
    if (new Date(d1) > new Date(d2)) return 1;

    return 0;
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
        if (!this.props.user) return;
        
        axios.post('/api/admin/users', {username: this.props.user.Username, password: this.props.user.Password})
        .then( res => {
            if (res.data.error)
            {
                console.error(res.data.message)
            }

            const display = res.data.data.map( (user, index) => {
                user.index = index;
                return user;
            })

            this.setState({
                display: display,
                users: display
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
        axios.post('/api/admin/reject', {username: this.props.user.Username, password: this.props.user.Password, user: user.Username})
        .then( res => {
            
            if (res.data.error)
            {
                alert(res.data.message);
                console.error(res.data.message);
                return;
            }

            const users = this.state.users;
            users[this.state.display[index].index].Validated = false;
            users[this.state.display[index].index].Rejected = true;

            const display = this.state.display;
            display[index].Validated = false;
            display[index].Rejected = true;

            this.setState({
                users: users,
                display: display
            })
        })
        .catch( err => {console.error(err);})
    }

    searchChange(event)
    {
        const display = this.state.users.filter ( user => {

            if (user.Username.toLowerCase().includes(event.target.value.toLowerCase())) 
                return true;

            return false;
        })

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
        const cells = this.state.display
        .sort( (a, b) => {
            switch(this.state.sort)
            {
                case "Username":
                   return __compareString(a.Username, b.Username);
                case "Name":
                    return __compareString(a.Name, b.Name);
                case "Status":
                    if (!a.Validated) return -1;
                    if (!b.Validated) return 1;
                    return 0;
                default: return 0;
            }
        })
        .slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
        .map( (user, index) => {
            let status;
            let statusClass = ""

            if (user.Validated)
            {
                status = "Validated \u2713";
                statusClass = "Validated"
            } 
            else
            {
                if (user.Rejected) 
                {
                    status = "Rejected \u2717";
                    statusClass = "Rejected" 
                }
                else 
                {
                    status = (
                        <Box>
                            <Button variant='contained' size='small' className="Validate Button" 
                                onClick={(event) => {this.validateUser(user, index); event.stopPropagation();}}>
                                Validate
                            </Button>
                            <Button variant='contained' size='small' className="Reject Button" 
                                onClick={(event) => {this.rejectUser(user, index); event.stopPropagation();}}>
                                Reject
                            </Button>
                        </Box>
                    ) 
                }
            }

            const oddity = index % 2 === 1 ? "odd" : "even";

            return (
                <TableRow onClick={(event) => {this.props.userClick(event, user.Username); event.preventDefault();}} className={`TableRow ${oddity}`} key={user.Username}>
                    {__cell(user.Username, 'left')}
                    {__cell(user.Email, 'left')}
                    {__cell(user.Name, 'left')}
                    {__cell(user.Address, 'left')}
                    {__cell(user.Country, 'left')}
                    {__cell(user.Phone, 'left')}
                    {__cell(status, 'left', `Status ${statusClass}`)}
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
                                    <MenuItem value="Status" >Status</MenuItem>
                                </Select>
                            </span>
                        </Box>
                        

                        <TablePagination
                            className="Pagination"
                            rowsPerPageOptions={[10, 15, 25, 50, 100]}
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
                            {__cell('Username', 'left')}
                            {__cell('Email', 'left')}
                            {__cell('Name', 'left')}
                            {__cell('Address', 'left')}
                            {__cell('Country', 'left')}
                            {__cell('Phone', 'left')}
                            {__cell('Status', 'left')}
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

class Auctions extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            display: [],
            auctions: [],
            page: 0,
            rowsPerPage: 10,
            sort: "Auction Name",
            search: "Auction Name",
            selected: [],
            openDialog: false
        }

        this.searchIndex = {
            "Auction Name": (auction, target) => {
                if (auction.Name.toLowerCase().includes(target.toLowerCase())) return true;
            },
            "Username": (auction, target) => {
                if (auction.User.Username.toLowerCase().includes(target.toLowerCase())) return true;
            },
        }

        autoBind(this);
    }

    componentDidMount()
    {
        
        if (!this.props.user) return;
        axios.post('/api/admin/auctions', {username: this.props.user.Username, password: this.props.user.Password})
        .then( res => {
            if (res.data.error)
            {
                console.error(res.data.message)
            }

            const display = res.data.data.map( (auction, index) => {
                auction.index = index;
                auction.selected = false;

                return auction;
            })

            this.setState({
                display: display,
                auctions: display
            })
        })
        .catch( err => {console.error(err);})
    }

    openExportDialog()
    {
        this.setState({
            openDialog: true
        })
    }

    closeExportDialog()
    {
        this.setState({
            openDialog: false
        })
    }

    selectAll(event)
    {
        let display = this.state.display;
        let auctions = this.state.auctions;

        for (let i = 0; i < display.length; i++)
        {
            display[i].selected = event.target.checked;
            auctions[display[i].index].selected = event.target.checked;
        }

        this.setState({
            display: display,
            auctions: auctions,
            selected: event.target.checked ? display : []
        })
    }

    select(event, index)
    {
        const realIndex = this.state.page * this.state.rowsPerPage + index;

        let display = this.state.display;
        const selected = !(display[realIndex].selected);

        display[realIndex].selected = selected;

        let auctions = this.state.auctions;
        auctions[display[realIndex].index].selected = selected;

        let newSelected = this.state.selected;

        if (selected)
        {
            newSelected.push(display[realIndex])
        }
        else
        {
            for (let i = 0; i < newSelected.length; i++)
            {
                if (newSelected[i].Id === display[realIndex].Id)
                {
                    newSelected.splice(i, 1);
                }
            }
        }

        this.setState({
            display: display,
            auctions: auctions,
            selected: newSelected
        })

        event.stopPropagation();
    }

    search(event)
    {
        const display = this.state.auctions.filter( (auction) => {
            if (this.searchIndex[this.state.search](auction, event.target.value)) return true;
            return false;
        })

        this.setState({
            display: display
        })
    }

    searchChange(event)
    {
        this.setState({
            search: event.target.value
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
        const cells = this.state.display
        .sort( (a, b) => {
            switch(this.state.sort)
            {
                case "Username":
                   return __compareString(a.User.Username, b.User.Username);
                case "Auction Name":
                    return __compareString(a.Name, b.Name);
                case "Started Date (Most Recent)":
                    return __compareDate(a.Started, b.Started);
                case "Ends Date (Most Recent)":
                    return __compareDate(a.Ends, b.Ends);
                default: return 0;
            }
        })
        .slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
        .map( (auction, index) => {

            const oddity = index % 2 === 1 ? "odd" : "even";

            return (
                <TableRow 
                    onClick={(event) => {this.select(event, index)}} 
                    className={`TableRow ${oddity}`} 
                    key={auction.Id}
                    aria-checked={auction.selected}
                    selected={auction.selected}
                >
                    <TableCell className={`TableCell`} align='left' /*onClick={(e) => {this.props.auctionClick(e, auction.Id);}}*/>
                        <Checkbox color="primary" checked={auction.selected} inputProps={{'aria-labelledby': `enhanced-table-checkbox-${auction.index}`}}/>
                        {auction.Name}
                    </TableCell>

                    <TableCell className={`TableCell`} align='left'>
                        <p className="AuctionUsername" onClick={(e) => {this.props.userClick(e, auction.User.Username);}}>{auction.User.Username}</p>
                    </TableCell>

                    {__cell(auction.First_Bid ? `\u20AC${parseFloat(auction.First_Bid).toFixed(2)}` : "-", 'left')}
                    {__cell(auction.Currently ? `\u20AC${parseFloat(auction.Currently).toFixed(2)}` : "-", 'left')}
                    {__cell(auction.Buy_Price ? `\u20AC${parseFloat(auction.Buy_Price).toFixed(2)}` : "-", 'left')}
                    {__cell(auction.Location, 'left')}
                    {__cell(new Date(auction.Started).toDateString(), 'left')}
                    {__cell(new Date(auction.Ends).toDateString(), 'left')}
                </TableRow>
            )
        })


        return (
            <Paper className="Auctions Paper">
                <AppBar position="sticky">
                    <Toolbar className="TableToolbar">
                        <Typography className="TableTitle" variant="h6" noWrap>
                            Export Auctions
                        </Typography>

                        <Button variant="contained" onClick={this.openExportDialog} className="Export Button" disabled={this.state.selected.length === 0}>
                            Export
                        </Button>

                        <ExportDialog open={this.state.openDialog} close={this.closeExportDialog} items={this.state.selected}/>

                        <InputBase
                            placeholder="Search…"
                            className="TableSearch"
                            inputProps={{ 'aria-label': 'search' }}
                            onChange={this.search}
                        />

                        <Box className="Sort">
                            <span>
                                Search By:
                                <Select 
                                    className="Select" value={this.state.search} 
                                    onChange={this.searchChange} 
                                    input={<InputBase className="TableSearch"/>}
                                >
                                    <MenuItem value="Username">Username</MenuItem>
                                    <MenuItem value="Auction Name">Auction Name</MenuItem>
                                </Select>
                            </span>
                        </Box>

                        <Box className="Sort">
                            <span>
                                Sort By:
                                <Select 
                                    className="Select" value={this.state.sort} 
                                    onChange={this.sort} 
                                    input={<InputBase className="TableSearch"/>}
                                >
                                    <MenuItem value="Username">Username</MenuItem>
                                    <MenuItem value="Auction Name">Auction Name</MenuItem>
                                    <MenuItem value="Started Date (Most Recent)" >Started Date (Most Recent)</MenuItem>
                                    <MenuItem value="StatEnds Date (Most Recent)us" >Ends Date (Most Recent)</MenuItem>
                                </Select>
                            </span>
                        </Box>

                        <TablePagination
                            className="Pagination"
                            rowsPerPageOptions={[10, 15, 25, 50, 100]}
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

                            <TableCell className={`TableCell`} align='left'>
                                <Checkbox 
                                    color="primary"
                                    indeterminate={this.state.selected.length > 0 && this.state.selected.length < this.state.display.length}
                                    checked={this.state.selected.length === this.state.display.length} 
                                    inputProps={{'aria-label': `select all auctions`}}
                                    onChange={this.selectAll}
                                />
                                Auction Name
                            </TableCell>

                            {__cell('Seller', 'left')}
                            {__cell('First Bid', 'left')}
                            {__cell('Current Bid', 'left')}
                            {__cell('Buy Price', 'left')}
                            {__cell('Location', 'left')}
                            {__cell('Started', 'left')}
                            {__cell('Ends', 'left')}
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

class ExportDialog extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            type: "JSON"
        }

        autoBind(this);
    }

    changeType(event)
    {
        this.setState({
            type: event.target.value
        })
    }

    export()
    {
        const download = (filename, text) => {
            var pom = document.createElement('a');
            var bb = new Blob([text], {type: 'text/plain'});
    
            pom.setAttribute('href', window.URL.createObjectURL(bb));
            pom.setAttribute('download', filename);
    
            pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
            pom.draggable = true; 
            pom.classList.add('dragout');
    
            pom.click();
        }

        const filename = this.state.type === "XML" ? "export.xml" : "export.json";

        
        if (this.state.type === "XML")
        {
            let xmlstring = "<Items>";
            for (let i = 0; i < this.props.items.length; i++)
            {
                const item = this.props.items[i];

                xmlstring += `<Item ItemID="${item.Id}"><Name>${item.Name}</Name><First_Bid>$7.00</First_Bid><Number_of_Bids>${item.Bids.length}</Number_of_Bids>`

                if (item.Bids.length !== 0)
                {
                    xmlstring += `<Bids>`

                    for (let j = 0; j < item.Bids.length; j++)
                    {
                        const bid = item.Bids[j];
                        xmlstring +=`<Bid><Bidder Rating="${bid.User.Bidder_Rating}" UserID="${bid.User.Username}"><Location>${bid.User.City}</Location><Country>${bid.User.Country}</Country>`
                        xmlstring += `</Bidder><Time>${bid.Time}</Time><Amount>${bid.Amount}</Amount></Bid>`
                    }
                    xmlstring +=`</Bids>`
                }
                
                xmlstring +=`<Location>J${item.Location}</Location><Country>${item.User.Country}</Country><Started>${item.Started}</Started><Ends>${item.Ends}</Ends>`
                xmlstring += `<Seller Rating="${item.User.Seller_Rating}" UserID="${item.User.Username}"/><Description>${item.Description}</Description></Item>`
            }

            xmlstring += "</Items>";

            const format = require("xml-formatter");
            const formatted = format(xmlstring);

            download(filename, formatted);
        }
        else
        {
            const jsonitems = this.props.items.map(item => {
                let newItem = {
                    ItemID: item.Id,
                    Name: item.Name,
                    First_Bid: item.First_Bid,
                    Currently: item.Currently,
                    Number_of_Bids: item.Bids.length,
                    Bids: item.Bids.map( bid => {
                        return {
                            Bidder: {
                                UserID: bid.User.Id,
                                Rating: bid.User.Bidder_Rating,
                                Location: bid.User.City,
                                Country: bid.User.Country
                            },
                            Time: bid.Time,
                            Amount: bid.Amount,
                        }
                    }),
                    Location: item.Location,
                    Country: item.User.Country,
                    Started: item.Started,
                    Ends: item.Ends,
                    Seller_Rating: item.User.Seller_Rating,
                    Description: item.Description
                }

                if (item.Buy_Price !== null) newItem.Buy_Price = item.Buy_Price;

                return newItem;
            })

            console.log(jsonitems);

            const toPrint = JSON.stringify(jsonitems, null,  4);

            download(filename, toPrint);
        }
    
    }

    render()
    {
        return (
            <Dialog className="ExportDialog" open={this.props.open} onClose={this.props.close}>
                <DialogTitle className="DialogTitle">
                    Exporting: {this.props.items.length} items
                    <Box>
                        Export to:
                        <Select 
                            className="Select" value={this.state.type} 
                            onChange={this.changeType} 
                        >
                            <MenuItem value="JSON">JSON</MenuItem>
                            <MenuItem value="XML">XML</MenuItem>
                        </Select>
                    </Box>
                </DialogTitle>

                <DialogContent className="DialogContent" dividers>
                    <List>
                        {
                            this.props.items.map(item => {
                                return (
                                    <ListItem key={item.Id}>
                                        <ListItemText className="ListItemText">{item.Name}</ListItemText>
                                    </ListItem>
                                )
                            })
                        }
                    </List>
                </DialogContent>

                <DialogActions>
                    <Button className="Button" onClick={this.props.close} color="primary">
                        Cancel
                    </Button>
                    <Button className="Button" onClick={this.export} color="primary">
                        Export
                    </Button>
                </DialogActions>

            </Dialog>
        )
    }
}

export default withRouter(AdminPage);