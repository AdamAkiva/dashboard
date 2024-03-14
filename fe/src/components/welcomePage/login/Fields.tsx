/******************************************************************************/

import styled from 'styled-components';

/******************************************************************************/

const FieldsStyle = styled.div`
  display: grid;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: black;
  justify-content: center;
`;

const Input = styled.input`
  height: 2.5rem;
  width: 17rem;
  margin-bottom: 1rem;
  background-color: rgba(114, 130, 214, 0.46);
  border-radius: 10px;
  border: transparent;
  outline: none;
  color: black;
  font-size: 1rem;
  padding: 0 1rem;
`;

/******************************************************************************/

const Fields = () => {
  return (
    <FieldsStyle>
      <Input placeholder={'Email'} />
      <Input placeholder={'Password'} />
    </FieldsStyle>
  );
};

export default Fields;
