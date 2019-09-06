import { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";



class AuctionPage extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            auctionId: props.match.params.auctionId
        };

        autoBind(this);
        this.state = {
            auctionId: props.match.params.id
        };
    }

    componentDidMount()
    {
        axios.get(`/api/auction?id=${this.state.auctionId}`)
        .then(res => {
            this.setState({
                auction: res.data.data
            }, () => console.log(this.state))
        })
        .catch(err => console.log(err));

        
    }

    render()
    {
        return null;
    }
}

export default withRouter(AuctionPage);