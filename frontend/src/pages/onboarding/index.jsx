import RootNavigation from "@/components/Nav/Nav";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import CategoryTile from "@/components/tiles/CategoryTile";
import useCategoriesStore from "@/stores/useCategoriesStore";
import { useRouter } from "next/router";

export default () => {
  const { role, domain, subDivision } = useCategoriesStore();
  const router = useRouter();

  return (
    <div className="flex flex-col h-full justify-between grow pt-8">
      <RootNavigation title="Select Categories" />

      <div className="flex grow flex-col justify-center">
        <h3 className="mb-4">You have selected</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <CategoryTile
            title={ role?.title ?? "Select the main category" }
            onClick={() => router.push("/onboarding/role")}
            disabled={false}
            isEmpty={!role}
          />

          <CategoryTile
            title={ domain?.title ?? "Select the subcategory" }
            onClick={() => router.push("/onboarding/domain")}
            disabled={!role}
            isEmpty={!domain}
          />

          <CategoryTile
            title={ subDivision?.title ?? "Select the subdomain" }
            onClick={() => router.push("/onboarding/sub-division")}
            disabled={!domain}
            isEmpty={!subDivision}
          />

        </div>
      </div>

      <PrimaryBtn
        onClick={() => {
          router.push("/questionnaire");
        }}
        disabled={!role || !domain || !subDivision}
        title="Confirm"
        classes="w-full block"
      />
    </div>
  );
};

export async function getServerSideProps() {
  return {
    props: {}, // forces SSR
  };
}