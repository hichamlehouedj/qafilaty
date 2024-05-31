import { gql, useLazyQuery } from "@apollo/client";

export const CURRENT_USER = gql`
    query CurrentAdmin {
        currentAdmin {
            id
            user_name
            person {
                last_name
                first_name
                id
                email
                company {
                    id
                    points
                    activation
                }
                list_stock_accesses {
                    stock {
                        id
                        name
                    }
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
