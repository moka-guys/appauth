import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';

export const useForm = (callback, initialState = {}) => {
  const [values, setValues] = useState(initialState);

  const onChange = (event, {name, value}) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const onChangeMulti = (event, {name, value}) => {
    setValues({ ...values, [name]: value });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    callback();
  };

  return{
    onChange,  // when changing single value fields
    onChangeMulti,  // when changing a multi-select
    setValues, // sets all values
    onSubmit,
    values
  };
};

// returns current user profile
export const useProfile = () => {
  const { data } = useQuery(gql`
    query {
      user {
        id
        email
      }
    }
  `);
  return data ? data.user : {};
};
