import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import managementStore from '@root/views/pages/management/store/ManagementStore';
import ServerApi from '@root/views/pages/management/store/server.api';
import { ReqGoogleLogin } from 'nestjs-api-axios';
import { ReactElement } from 'react';

export interface GoogleLoginProps {
  useOneTap?: boolean;
}

export function GoogleLoginButton(props: GoogleLoginProps): ReactElement {
  const { useOneTap = false } = props;

  return (
    <GoogleLogin
      cancel_on_tap_outside={false}
      useOneTap={useOneTap}
      onSuccess={async function (credentialResponse: CredentialResponse): Promise<void> {
        const params: ReqGoogleLogin = {
          token: credentialResponse.credential ?? '',
        };
        const response = await ServerApi.google.googleControllerGoogleLogin(params);
        if (response.data.data) {
          const profile = response.data.data.profile as any;
          managementStore.setUser({
            token: response.data.data.jwt.access_token,
            email: profile?.email ?? '',
            name: profile?.name ?? '',
            role: response.data.data.role ?? '',
          });
        }
      }}
    ></GoogleLogin>
  );
}
