import { useEffect } from "react";
import { Meta } from "~/components/layouts";

export default function ZuzaluQF() {
  useEffect(() => {
    window.location.href = "https://explorer.gitcoin.co/?utm_source=grants.gitcoin.co&utm_medium=internal_link&utm_campaign=gg19&utm_content=independent-rounds#/round/10/0xd875fa07bedce182377ee54488f08f017cb163d4/0xd875fa07bedce182377ee54488f08f017cb163d4-5";
  }, []);

  return (<>
    <Meta
        meta={{
          title: "NeuroFusion - The simplest way to do brain and behavior research",
          description: "Record brain activity from your home while doing cognitive experiments and get instant results",
          image: "https://usefusion.app/images/features/neurofusion_experiment.png"
        }}
      />
  </>);
}
