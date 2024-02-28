/******************************************************************************/

import styled from 'styled-components';

/******************************************************************************/

const LoginSection = styled.div`
  background-color: white;
  color: rgba(55, 61, 122, 0.8);
  font-size: 2rem;
  display: flex;
  justify-content: center;
`;

const LoginTitle = styled.div`
  margin-top: 11rem;
  display: flex;
  justify-content: center;
`;

const LoginFields = styled.div`
  display: grid;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: black;
  justify-content: center;
`;

const LoginButton = styled.div`
  display: flex;
  justify-content: center;
}`;

const SignupOption = styled.div`
  margin-top: 1.5rem;
  font-size: 1.1rem;
  color: #9e60b6;
}`;

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

const Button = styled.button`
  background-image: linear-gradient(to right, #b15da3, #939dec 100%);
`;

const Login = () => {
  return (
    <LoginSection>
      <div>
        <LoginTitle>USER LOGIN</LoginTitle>
        <LoginFields>
          <Input />
          <Input />
        </LoginFields>
        <LoginButton>
          <Button>LOGIN</Button>
        </LoginButton>
        <SignupOption>
          <span>New to Dashboard? click here to sign up</span>
        </SignupOption>
      </div>
    </LoginSection>
  );
};

export default Login;
