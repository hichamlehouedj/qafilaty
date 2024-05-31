import { gql, useLazyQuery} from "@apollo/client";

export const CURRENT_USER = gql`
    query CurrentUser {
        currentUser {
            id
            user_name
            person {
                last_name
                first_name
                id
                email
                list_stock_accesses {
                    stock {
                        id
                        city
                    }
                }
                company {
                    id
                    phone01
                    phone02
                    email
                    city
                    TVA
                    activation
                    address
                    change_price
                    name
                    points
                    return_price
                    logo
                    plus_size
                    plus_tail
                    value_plus_size
                    value_plus_tail
                    defult_weight
                    defult_length
                    createdAt
                    pickup

                    encapsulation_price
                    encapsulation
                    pickup_price
                    pickup
                    price_in_state
                }
            }
        }
    }
`;

interface Props {}

const UseGetCurrentUser = () => {
    let currentUserResult = useLazyQuery(CURRENT_USER);
    return currentUserResult;
};

export default UseGetCurrentUser;
