export const getEnvValue = (name: string) => {
  const envKey = `DASHBOARD_${name}`;

  const envValue = (import.meta.env[envKey] as string | undefined) ?? '';
  if (!envValue) {
    console.error(`Environment value: ${envKey} does not exist`);
  }

  return envValue;
};

export const getRuntimeMode = () => {
  return import.meta.env.MODE;
};
