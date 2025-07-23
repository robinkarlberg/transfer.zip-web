import BIcon from "@/components/BIcon";

export default function SelfHostingGuide() {
  return (
    <>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Host Your Own File Sharing Server with Transfer.zip
      </h1>

      <p className="mt-6 text-xl leading-8">
        Follow these steps to spin up a production-ready Transfer.zip instance on your own
        infrastructure in just a few minutes.
      </p>

      <div className="mt-10 max-w-2xl">
        <p>&rarr; In this guide, you will learn how to:</p>

        <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
          <li className="flex gap-x-3">
            <BIcon
              name="check-circle"
              aria-hidden="true"
              className="mt-1 h-5 w-5 flex-none text-primary"
            />
            <span>
              <strong className="font-semibold text-gray-900">Prepare your environment.</strong>{" "}
              Scaffold all <code>.env</code> files and pull the required Docker images with one
              command.
            </span>
          </li>

          <li className="flex gap-x-3">
            <BIcon
              name="check-circle"
              aria-hidden="true"
              className="mt-1 h-5 w-5 flex-none text-primary"
            />
            <span>
              <strong className="font-semibold text-gray-900">Enable Quick Transfers.</strong>{" "}
              Launch the lightweight service for one-off uploads and test end-to-end locally.
            </span>
          </li>

          <li className="flex gap-x-3">
            <BIcon
              name="check-circle"
              aria-hidden="true"
              className="mt-1 h-5 w-5 flex-none text-primary"
            />
            <span>
              <strong className="font-semibold text-gray-900">Launch Stored Transfers.</strong>{" "}
              Deploy the dedicated Node worker, add the main server's public key, and optionally
              plug in S3 for scalable storage.
            </span>
          </li>

          <li className="flex gap-x-3">
            <BIcon
              name="check-circle"
              aria-hidden="true"
              className="mt-1 h-5 w-5 flex-none text-primary"
            />
            <span>
              <strong className="font-semibold text-gray-900">Secure &amp; expose your instance.</strong>{" "}
              Use the built-in Caddy reverse-proxy for free HTTPS, or drop behind Apache/NGINX with
              copy-pasta configs.
            </span>
          </li>

          <li className="flex gap-x-3">
            <BIcon
              name="check-circle"
              aria-hidden="true"
              className="mt-1 h-5 w-5 flex-none text-primary"
            />
            <span>
              <strong className="font-semibold text-gray-900">Create an admin account.</strong>{" "}
              Run the helper script to bootstrap your first user and start sharing files right
              away.
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-16 prose prose-slate max-w-none">
        <h2 id="setting-up" className="text-2xl font-semibold tracking-tight text-gray-900">
          Setting up
        </h2>

        <h3 className="mt-6 text-xl font-semibold text-gray-900">Quick Transfers</h3>
        <ol className="list-decimal ml-6 space-y-2">
          <li>
            Run <code className="px-1 py-0.5 rounded bg-gray-100">./createenv.sh</code> to scaffold
            all environment files.
          </li>
        </ol>

        <h3 className="mt-6 text-xl font-semibold text-gray-900">Stored Transfers</h3>
        <ol className="list-decimal ml-6 space-y-2">
          <li>
            Start the worker once with{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">docker compose up worker</code>;
            copy the printed public key.
          </li>
          <li>
            Clone{" "}
            <a
              href="https://github.com/robinkarlberg/transfer.zip-node"
              className="text-primary underline"
            >
              transfer.zip-node
            </a>{" "}
            on any server reachable by the internet.
          </li>
          <li>
            Inside the node repo, run{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">./createenv.sh</code>.
          </li>
          <li>
            <strong>If you prefer S3 storage:</strong> edit{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">server/conf.json</code> and switch the{" "}
            <code>active</code> provider.
          </li>
          <li>
            <strong>If you use built-in Caddy:</strong> add your <code>DOMAIN</code> and{" "}
            <code>EMAIL</code> in <code>.env</code>.
          </li>
          <li>
            Paste the public key into{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">./keys/public.pem</code>.
          </li>
          <li>
            Deploy the node server with{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">docker compose up -d</code> or{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">./deploy-caddy.sh</code>.
          </li>
          <li>
            Back in the main repo, edit{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">next/conf.json</code> to point to the
            node server's public URL.
          </li>
          <li>
            <strong>Optional branding:</strong> adjust{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">S3_*</code> variables in{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">next/.env</code>.
          </li>
          <li>
            Create your first account with{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">./create-account.sh</code> while the
            main server is running.
          </li>
        </ol>

        <h2 id="deploying" className="mt-10 text-2xl font-semibold tracking-tight text-gray-900">
          Deploying
        </h2>

        <h3 className="mt-6 text-xl font-semibold text-gray-900">Caddy (built-in)</h3>
        <p>For a zero-config HTTPS setup, run:</p>
        <pre className="rounded bg-gray-100 p-4 text-sm">
          <code>./deploy-caddy.sh</code>
        </pre>
        <p className="mt-2">
          <strong className="font-semibold text-red-600">Warning&nbsp;</strong>The Caddy container
          listens on <code>0.0.0.0</code>; firewall it if you don't want it public.
        </p>

        <h3 className="mt-6 text-xl font-semibold text-gray-900">Any other reverse-proxy</h3>
        <pre className="rounded bg-gray-100 p-4 text-sm">
          <code>docker compose up --build -d</code>
        </pre>

        <h4 className="mt-4 font-semibold text-gray-900">Apache</h4>
        <pre className="rounded bg-gray-100 p-4 text-sm">
          <code>{`ProxyPreserveHost On

ProxyPass /ws ws://localhost:9002/
ProxyPassReverse /ws ws://localhost:9002/

ProxyPass / http://localhost:9001/
ProxyPassReverse / http://localhost:9001/`}</code>
        </pre>

        <h4 className="mt-4 font-semibold text-gray-900">NGINX</h4>
        <pre className="rounded bg-gray-100 p-4 text-sm">
          <code>{`# Put this at the top
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# In your server block
location /ws {
    proxy_pass http://localhost:9001/ws;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
}`}</code>
        </pre>
      </div>
    </>
  );
}
