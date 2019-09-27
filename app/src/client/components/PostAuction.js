import React, {Component} from 'react';
import autoBind from 'auto-bind';
import axios from 'axios';

import { Dialog, DialogTitle, DialogContent, Grid, TextField, DialogActions, Button, InputAdornment, Select, MenuItem, FormControl, InputLabel, Chip } from '@material-ui/core';

export default class PostAuction extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            categoryOptions: [],
            Name: "",
            Description: "",
            StartingPrice: "",
            BuyoutPrice: "",
            BuyoutPriceError: "",
            Location: "",
            Latitude: "",
            Longitude: "",
            Ends: "",
            EndsError: "",
            Images: null,
            Categories: []
        }

        const EUR = {
            startAdornment: <InputAdornment position="start">EUR</InputAdornment>,
        }

        this.fields = [
            {label: "Name", type: "text", name: "Name", placeholder: "AWESOME Coffee Mugs - Wonder Emporium", required: true},
            {label: "Description", type: "text", name: "Description", placeholder: "...", multiline: true},
            {label: "Starting Price", type: "number", name: "StartingPrice", placeholder: "25.00", required: true, InputProps: EUR},
            {label: "Buyout Price", type: "number", name: "BuyoutPrice", placeholder: "40.00", InputProps: EUR},
            {label: "Latitude", type: "number", name: "Latitude", placeholder: "13.1293612"},
            {label: "Longitude", type: "number", name: "Longitude", placeholder: "14.1237126876"},
            {label: "Location", type: "text", name: "Location", placeholder: "Manhattan - NYC", required: true},
            {label: "", type: "datetime-local", name: "Ends", placeholder: "", required: true}
        ]

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
                this.setState({
                    categoryOptions: res.data.data
                })
            }
        })
        .catch(err => console.log(err));
    }

    onOpen()
    {
        if (!this.props.user.Validated)
        {
            this.closeDialog();
            alert("Non validated users cannot post auctions. Please contact admins.");
        }
    }

    closeDialog()
    {
        this.clearState();
        this.props.toggleDialog();
    }

    clearState()
    {
        this.setState({
            categoryOptions: [],
            Name: "",
            Description: "",
            StartingPrice: "",
            BuyoutPrice: "",
            Location: "",
            Latitude: "",
            Longitude: "",
            Images: null,
            Categories: []
        })
    }

    change(event, name)
    {
        let newState = this.state;
        newState[name] = event.target.value;

        this.setState(newState);
    }

    imageChange(event)
    {
        this.setState({
            Images: event.target.files[0]
        })
    }

    blur(event, name)
    {
        if (name === "BuyoutPrice" || name === "StartingPrice")
        {
            const bp = parseFloat(this.state.BuyoutPrice);
            const sp = parseFloat(this.state.StartingPrice);

            if (isNaN(bp) || isNaN(sp)) return;

            if (bp < sp)
            {
                this.setState({
                    BuyoutPriceError: "Buyout Price cannot be lower or equal to Starting Price"
                })
            }
            else
            {
                this.setState({
                    BuyoutPriceError: ""
                })
            }
        }

        if (name === "Ends")
        {
            const diff = new Date(this.state.Ends) - new Date()
            if (!isNaN(diff) && diff <= 0)
            {
                this.setState({
                    EndsError: "End Date-Time cannot be before Now"
                })
            }
            else
            {
                this.setState({
                    EndsError: ""
                })
            }
        }
    }

    FormInput(props)
    {
        const item = props.item;

        return (
            <Grid item xs={6}>
                {
                    item.name === "Ends" ? (
                        <InputLabel shrink htmlFor="age-label-placeholder">
                            End Date-Time
                        </InputLabel>) : null
                }
                <TextField
                    className="TextField"
                    required={item.required}
                    error={ this.state[`${item.name}Error`] && this.state[`${item.name}Error`] !== "" ? true : false}
                    title={this.state[`${item.name}Error`]}
                    label={item.label}
                    value={this.state[item.name]}
                    placeholder={item.placeholder}
                    type={item.type}
                    onChange={ (e) => {this.change(e, item.name); } }
                    onBlur={(e) => this.blur(e, item.name)}
                    InputProps={item.InputProps}
                    multiple={item.multiple}
                    multiline={item.multiline}
                    marign="normal"
                />
            </Grid>
        )
    }

    post()
    {
        // Post auction
        if (this.state.Name === "" || this.state.StartingPrice === "" || this.state.Location === "")
        {
            alert("Please fill out all required fields")
            return;
        }

        if (this.state.EndsError !== "" || this.state.BuyoutPriceError !== "")
        {
            alert("Please resolve all errors");
            return;
        }

        axios.post("/api/postAuction", {
            username: this.props.user.Username,
            password: this.props.user.Password,
            name: this.state.Name,
            description: this.state.Description,
            first_bid: this.state.StartingPrice,
            buy_price: this.state.BuyoutPrice,
            location: this.state.Location,
            latitude: this.state.Latitude,
            longitude: this.state.Longitude,
            ends: this.state.Ends,
            categories: this.state.Categories
        })
        .then( res => {
            if (res.data.error)
            {
                console.error(res.data.message)
                alert(res.data.message);

                return;
            }

            if (this.state.Images)
                this.postImage(res.data.data);
                
            this.closeDialog();
        })
        .catch( err => console.error(err))
    }

    postImage(auctionId)
    {
        console.log(this.state.Images)
        console.log("TCL: auctionId", auctionId)

        let formData = new FormData();
        formData.append('file', this.state.Images)
        formData.append('auction_id', auctionId)

        axios.post('/api/uploadImage', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then( res => {
            if (res.data.error)
            {
                console.log(res.data.message);
                alert(res.data.message);
                return;
            }
        })
        .catch( err => console.error(err));
    }

    render()
    {
        return (
            <Dialog 
                open={this.props.open}
                onClose={this.closeDialog}
                onEnter={this.onOpen}
            >
                <DialogTitle>Post New Auction</DialogTitle>

                <DialogContent>
                    <Grid container spacing={2}>
                        {this.fields.map( item => <this.FormInput item={item}  key={`${item.name}TextField`}/>)}

                        <Grid item xs={6}>
                            <InputLabel shrink htmlFor="age-label-placeholder">
                                Image
                            </InputLabel>
                            <input
                                accept="image/*"
                                type="file"
                                onChange={this.imageChange}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl>
                                <InputLabel shrink htmlFor="age-label-placeholder">
                                    Category
                                </InputLabel>
                                <Select
                                    fullWidth
                                    multiple
                                    value={this.state.Categories}
                                    onChange={(e) => this.change(e, "Categories")}
                                    renderValue={selected => (
                                        <div>
                                            { selected.map(value => {
                                                return <Chip key={value} label={value} />
                                            })}
                                        </div>
                                    )}
                                >
                                    {this.state.categoryOptions.map( cat => {
                                        return (
                                            <MenuItem key={cat.Id} value={cat.Name}>
                                                {cat.Name}
                                            </MenuItem>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                            
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={this.closeDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.post} color="primary">
                        Post
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}