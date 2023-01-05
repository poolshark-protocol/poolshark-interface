import { useContext, useState, useEffect } from 'react';
import { CoinContext } from '../context/Coin.context'
import CoinListItem from '../components/CoinListItem';
import CoinListBtn from '../components/CoinListBtn';

function SelectTokenModal(props) {
    const [inputVal, setInputVal] = useState("")
    const { coins } = useContext(CoinContext)
    const [coinsForListing, setCoinsForListing] = useState(coins.slice(0, 20))


    const findCoin = () => {
        if (inputVal.length === 0) {
            setCoinsForListing(coins.slice(0, 20))
        } else {
            if (inputVal.length === 42 && inputVal.substring(0, 2) === "0x") {
                let searchedCoin = coins.find(token => token.id === inputVal)
                if (searchedCoin != undefined) {
                    setCoinsForListing([searchedCoin])
                }
            } else {
                let searchedCoins = coins.filter(coin => coin.name.toUpperCase().includes(inputVal.toUpperCase()) || coin.symbol.toUpperCase().includes(inputVal.toUpperCase()))

                if (searchedCoins.length > 20) {
                    searchedCoins = searchedCoins.slice(0, 20)
                }
                setCoinsForListing(searchedCoins)
            }
        }
    }

    const chooseToken = (e) => {
        const coin = e.target.dataset 
        props.chooseCoin({
            name:coin.name, 
            address:coin.address, 
            symbol: coin.symbol, 
            logoURI:coin.logouri, 
            decimals:coin.decimals
        })
        close()
    }

    const close = () => {
        props.onClose()
    }


    useEffect(() => {
        findCoin()
    }, [inputVal]);

    return (

    );
}
export default SelectTokenModal

