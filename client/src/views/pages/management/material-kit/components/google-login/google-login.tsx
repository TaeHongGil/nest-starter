import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { ApiEndpoints } from '@root/views/pages/management/store/api.endpoints';
import managementStore from '@root/views/pages/management/store/ManagementStore';
import { ReactElement } from 'react';

export interface GoogleLoginProps {
  useOneTap?: boolean;
}

export function GoogleLoginButton(props: GoogleLoginProps): ReactElement {
  const { useOneTap = false } = props;

  return (
    <GoogleLogin
      useOneTap={useOneTap}
      onSuccess={async function (credentialResponse: CredentialResponse): Promise<void> {
        const response = await managementStore.sendRequest(ApiEndpoints.GOOGLE_LOGIN, {
          token: credentialResponse.credential,
        });

        const data = response?.data;
        if (data) {
          managementStore.setUser({
            email: data.profile?.email,
            token: data.jwt.access_token,
            name: data.profile?.name,
            role: data.role,
          });
        }

        console.log('User logged in:', credentialResponse);
      }}
    ></GoogleLogin>
  );
}
