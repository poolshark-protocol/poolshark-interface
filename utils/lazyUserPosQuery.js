import { useQuery, gql } from '@apollo/client'
import { useState } from 'react'

const GET_POSITIONS = gql`
    query Positions($positionsInput: PositionsInputFilter) {
        positions(input: $positionsInput) {
            id
            inAmount
            inToken {
                id
                name
                symbol
                decimals
            }
            liquidity
            lower
            outAmount
            outToken {
                id
                name
                symbol
                decimals
            }
            owner
            pool {
                factory
                id
                inputPool
                token0 {
                    id
                    name
                    symbol
                    decimals
                }
                token1 {
                    id
                    name
                    symbol
                    decimals
                }
            }
            txnHash
            upper
        }
    }
`;

function usePositionFilters() {
    const [filters, _updateFilters] = useState({
        id: undefined
    });
    const updateFilter = (filterType, value) => {
        _updateFilter({
            [filterType]: value
        });
    };
    return {
        models: { filters },
        operations: { updateFilter }
    };
}

function userPosQuery(address) {
    //const { models, operations } = usePositionFilters();

    const { loading, error, data, refetch } = useQuery(GET_POSITIONS);

    if (loading) return <div>Loading</div>;
    if (error) return <div>error</div>;

    return(
        <div>
            <div onLoad={() => refetch({
                positionsInput: { owner: address.toBytes() },
            })}>
            </div>
        </div>
    );
}

        