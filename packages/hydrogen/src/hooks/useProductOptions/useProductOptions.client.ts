import {useCallback, useEffect, useMemo, useState} from 'react';
import {flattenConnection} from '../../utilities';
import {SelectedOptions, ProductOptionsHookValue} from './types';
import {getOptions, getSelectedVariant} from './helpers';
import type {
  SellingPlan,
  SellingPlanAllocation,
  ProductVariantConnection,
  SellingPlanGroupConnection,
  ProductVariant as ProductVariantType,
} from '../../storefront-api-types';
import type {PartialDeep} from 'type-fest';

/**
 * The `useProductOptions` hook returns an object that enables you to keep track of the
 * selected variant and/or selling plan state, as well as callbacks for modifying the state.
 */
export function useProductOptions({
  variants: variantsConnection,
  sellingPlanGroups: sellingPlanGroupsConnection,
  initialVariantId: explicitVariantId,
}: {
  /** The product's `VariantConnection`. */
  variants?: PartialDeep<ProductVariantConnection>;
  /** The product's `SellingPlanGroups`. */
  sellingPlanGroups?: PartialDeep<SellingPlanGroupConnection>; // This comes from the Product
  /** The initially selected variant. */
  initialVariantId?: ProductVariantType['id'] | null;
}): ProductOptionsHookValue {
  // The flattened variants
  const variants = useMemo(
    () => (variantsConnection ? flattenConnection(variantsConnection) : []),
    [variantsConnection]
  );

  // All the options available for a product, based on all the variants
  const options = useMemo(() => getOptions(variants), [variants]);

  // TODO: we have some weird variable shadowing going on here that probably needs to be looked at. This variable is the same name as a prop
  const initialVariantId =
    explicitVariantId === null
      ? (explicitVariantId as null)
      : variants.find((variant) => variant.id === explicitVariantId) ||
        variants.find((variant) => variant.availableForSale) ||
        variants[0];
  /**
   * Track the selectedVariant within the hook. If `initialVariantId`
   * is passed, use that as an initial value.
   */
  const [selectedVariant, setSelectedVariant] = useState<
    PartialDeep<ProductVariantType> | undefined | null
  >(initialVariantId);

  /**
   * Track the selectedOptions within the hook. If a `initialVariantId`
   * is passed, use that to select initial options.
   */
  const [selectedOptions, setSelectedOptions] = useState(
    selectedVariant?.selectedOptions
      ? selectedVariant.selectedOptions.reduce((memo, optionSet) => {
          memo[optionSet?.name ?? ''] = optionSet?.value ?? '';
          return memo;
        }, {} as SelectedOptions)
      : {}
  );

  /**
   * When the initialVariantId changes, we need to make sure we
   * update the selected variant and selected options. If not,
   * then the selected variant and options will reference incorrect
   * values.
   */
  useEffect(() => {
    const variant = getSelectedVariant(variants, selectedOptions);
    setSelectedVariant(variant);
  }, [selectedOptions, variants]);

  /**
   * Allow the developer to select an option.
   */
  const setSelectedOption = useCallback(
    (name: string, value: string) => {
      setSelectedOptions((selectedOptions) => ({
        ...selectedOptions,
        [name]: value,
      }));
    },
    [setSelectedOptions]
  );

  const isOptionInStock = useCallback(
    (option: string, value: string) => {
      const proposedVariant = getSelectedVariant(variants, {
        ...selectedOptions,
        ...{[option]: value},
      });

      return proposedVariant?.availableForSale ?? true;
    },
    [selectedOptions, variants]
  );

  const sellingPlanGroups = useMemo(
    () =>
      sellingPlanGroupsConnection
        ? flattenConnection(sellingPlanGroupsConnection).map(
            (sellingPlanGroup) => ({
              ...sellingPlanGroup,
              sellingPlans: sellingPlanGroup?.sellingPlans
                ? flattenConnection(sellingPlanGroup.sellingPlans)
                : [],
            })
          )
        : [],
    [sellingPlanGroupsConnection]
  );

  /**
   * Track the selectedSellingPlan within the hook. If `initialSellingPlanId`
   * is passed, use that as an initial value. Look it up from the `selectedVariant`, since
   * that is also a requirement.
   */
  const [selectedSellingPlan, setSelectedSellingPlan] = useState<
    SellingPlan | undefined
  >(undefined);

  const selectedSellingPlanAllocation = useMemo<
    SellingPlanAllocation | undefined
    // @ts-ignore The types here are broken on main, need to come back and fix them sometime
  >(() => {
    if (!selectedVariant || !selectedSellingPlan) {
      return;
    }

    if (!selectedVariant.sellingPlanAllocations) {
      throw new Error(
        `You must include sellingPlanAllocations in your variants in order to calculate selectedSellingPlanAllocation`
      );
    }

    return flattenConnection(selectedVariant.sellingPlanAllocations).find(
      // @ts-ignore The types here are broken on main, need to come back and fix them sometime
      (allocation) => allocation.sellingPlan.id === selectedSellingPlan.id
    );
  }, [selectedVariant, selectedSellingPlan]);

  return {
    // @ts-ignore The types here are broken on main, need to come back and fix them sometime
    variants,
    // @ts-ignore The types here are broken on main, need to come back and fix them sometime
    variantsConnection,
    options,
    // @ts-ignore The types here are broken on main, need to come back and fix them sometime
    selectedVariant,
    setSelectedVariant,
    selectedOptions,
    setSelectedOption,
    setSelectedOptions,
    isOptionInStock,
    selectedSellingPlan,
    setSelectedSellingPlan,
    selectedSellingPlanAllocation,
    // @ts-ignore The types here are broken on main, need to come back and fix them sometime
    sellingPlanGroups,
    // @ts-ignore The types here are broken on main, need to come back and fix them sometime
    sellingPlanGroupsConnection,
  };
}
