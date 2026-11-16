import { useAddOnEditor } from "../hooks/useAddOnEditor";
import VendorPageLoadingState from "../../../components/shared/VendorPageLoadingState";
import ProductEditorForm from "../components/create-addon/ProductEditorForm";
export default function CreateAddOnPage() {
  const editor = useAddOnEditor();
  if (editor.isLoading) return <VendorPageLoadingState variant="form" />;
  return <ProductEditorForm editor={editor} />;
}
