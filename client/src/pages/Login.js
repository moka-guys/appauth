import React, { useContext, useState, useEffect } from 'react';
import { Button, Form, Header, Segment } from 'semantic-ui-react';
import { useMutation, gql } from '@apollo/client';
import { AuthContext } from '../context/auth';
import { useForm } from '../util/hooks';

function Login({history,location}) {
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const { onChange, onSubmit, values } = useForm(requestLoginCallback, { email: '' });

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    update(_, { data: { login: userData } }) {
      context.login(userData);
      history.push('/');
    },
    onError(err) {
      setErrors({ token: err.graphQLErrors[0].message });
    },
  });

  const [requestLogin] = useMutation(EMAIL_LOGIN, {
    update(_, { data }) {
      if (data.requestLogin) {
        setErrors({requestLogin: "Email sent!"});
      } else {
        setErrors({requestLogin: "Can only issue one token per hour!"});
      }
    },
    onError(err) {
      setErrors({ email: err.graphQLErrors[0].message });
    },
    variables: values
  });

  useEffect(() => {
    if (location.search) {
      const token = new URLSearchParams(location.search).get('token')
      if (token) loginUser({ variables: { token } });
    }
  }, [location.search]);


  function requestLoginCallback() {
    requestLogin();
  }


  return (
    <div className="form-container">
      <Header as='h1'>Request Login</Header>
      <Segment>
        Provide your email address and we will send you a link to log in.
        If you have not been approved by an admin, you will not be able to log in but will have to wait for access approval.
      </Segment>
      <Form onSubmit={onSubmit} noValidate className={loading ? 'loading' : ''}>
        <Form.Input
          label="Email"
          placeholder="Work email"
          name="email"
          type="text"
          value={values.email}
          error={errors.email ? true : false}
          onChange={onChange}
        />
        <Button type="submit" primary>
          Request one-time login link
        </Button>
      </Form>
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

const LOGIN_USER = gql`
  mutation login($token: String!) {
    login(token: $token) {
      id
      email
      token
    }
  }
`;

const EMAIL_LOGIN = gql`
  mutation requestLogin($email: String!) {
    requestLogin(email: $email) 
  }
`;


export default Login;
