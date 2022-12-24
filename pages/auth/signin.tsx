import { Provider } from "next-auth/providers";
import { getProviders, signIn } from "next-auth/react";

export default function SignIn({ providers }: { providers: Provider[] }) {
  return (
    <>
      {Object.values(providers).map((provider: Provider) => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider.id, { callbackUrl: "/" })}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </>
  );
}

export async function getServerSideProps(context: any) {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
