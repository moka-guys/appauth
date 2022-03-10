
import React, { useState, useEffect } from 'react';
import { Header, Segment } from 'semantic-ui-react';
import { useMutation, gql } from '@apollo/client';

function Approve({location}) {
  const [errors, setErrors] = useState({});
  const [approveUser, { loading, data }] = useMutation(APPROVE_USER, {
    onError(err) {
      setErrors({ token: err.graphQLErrors[0].message});
    },
  });


  useEffect(() => {
    if (location.search) {
      const token = new URLSearchParams(location.search).get('token')
      if (token) approveUser({ variables: { token } });
    }
  }, [location.search]);

  console.log({loading, data});

  return (
    <div>
      <Header as='h1'>Access approval</Header>
      {data && data.approveUser ? (
        <>
          <Header>{data.approveUser.email}</Header>
          <p>
          {data.approveUser.approvedLevel === 0 ? "Access has been denied by " :
            data.approveUser.approvedLevel === 1 ? "Access has been granted by " :
              data.approveUser.approvedLevel === 2 ? "Access and approval rights have been granted by " : null} 
            <b>{data.approveUser.approvedBy}</b><br/>
          on {Date(data.approveUser.approvedAt)}</p>
        </>
      ) : (
        <Segment>
          You need to click the link you received in the email to approve a user request.
        </Segment>
      )}
      {/* passwordless login/reset */}
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const APPROVE_USER = gql`
  mutation approveUser($token: String!) {
    approveUser(token: $token) {
      id
      email
      createdAt
      approvedAt
      approvedBy
      approvedLevel
    }
  }
`;

export default Approve;
