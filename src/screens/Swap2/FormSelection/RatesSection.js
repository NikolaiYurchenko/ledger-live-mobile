// @flow

import { useTheme } from "@react-navigation/native";
import React, { useMemo, useCallback } from "react";
import { Trans } from "react-i18next";
import { StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { BigNumber } from "bignumber.js";

import {
  getAccountUnit,
  getAccountName,
} from "@ledgerhq/live-common/lib/account";

import type {
  Account,
  TokenAccount,
  AccountLikeArray,
  TokenCurrency,
  CryptoCurrency,
} from "@ledgerhq/live-common/lib/types";
import type {
  SwapTransaction,
  ExchangeRate,
} from "@ledgerhq/live-common/lib/exchange/swap/types";
import type { SwapDataType } from "@ledgerhq/live-common/lib/exchange/swap/hooks";
import type { SwapRouteParams } from "..";

import CurrencyUnitValue from "../../../components/CurrencyUnitValue";
import { NavigatorName, ScreenName } from "../../../const";
import GenericInputLink from "./GenericInputLink";
import Changelly from "../../../icons/swap/Changelly";
import Wyre from "../../../icons/swap/Wyre";
import Lock from "../../../icons/Lock";
import Unlock from "../../../icons/Unlock";
import CurrencyIcon from "../../../components/CurrencyIcon";
import LText from "../../../components/LText";
import Button from "../../../components/Button";

export const providerIcons = {
  changelly: Changelly,
  wyre: Wyre,
};

type Props = {
  navigation: *,
  route: { params: SwapRouteParams },
  swap: SwapDataType,
  transaction: SwapTransaction,
  status: *,
  rate: ExchangeRate,
  setToAccount: (
    currency: TokenCurrency | CryptoCurrency,
    account: Account | TokenAccount,
    parentAccount?: Account | TokenAccount,
  ) => void,
  providers: any,
  provider: any,
  accounts: AccountLikeArray,
};
export default function RatesSection({
  navigation,
  route,
  swap,
  transaction,
  status,
  rate,
  providers,
  provider,
}: Props) {
  const { colors } = useTheme();

  const {
    from: { account: fromAccount },
    to: { account: toAccount, currency: toCurrency },
  } = swap;

  const fromUnit = useMemo(() => fromAccount && getAccountUnit(fromAccount), [
    fromAccount,
  ]);

  const onEditRateProvider = useCallback(() => {
    navigation.navigate(ScreenName.SwapFormV2SelectProviderRate, {
      ...route.params,
      selectedCurrency: toCurrency,
      rate,
      transaction,
      providers,
      provider,
    });
  }, [
    navigation,
    provider,
    providers,
    rate,
    route.params,
    toCurrency,
    transaction,
  ]);

  const onEditToAccount = useCallback(() => {
    navigation.navigate(ScreenName.SwapV2FormSelectAccount, {
      ...route.params,
      selectedCurrency: toCurrency,
      target: "to",
      providers,
      provider,
    });
  }, [navigation, provider, providers, route.params, toCurrency]);

  const onEditFees = useCallback(() => {
    navigation.navigate(ScreenName.SwapV2FormSelectFees, {
      ...route.params,
      selectedCurrency: toCurrency,
      target: "to",
      transaction,
      providers,
      provider,
    });
  }, [navigation, provider, providers, route.params, toCurrency, transaction]);

  const onAddAccount = useCallback(() => {
    navigation.navigate(NavigatorName.AddAccounts, {
      screen: ScreenName.AddAccountsSelectDevice,
      params: {
        currency: toCurrency,
        returnToSwap: true,
        onSuccess: () => navigation.navigate(ScreenName.SwapForm),
      },
    });
  }, [navigation, toCurrency]);

  const ProviderIcon = providerIcons[provider];

  const { magnitudeAwareRate, tradeMethod } = rate || {};
  const toAccountName = toAccount ? getAccountName(toAccount) : null;

  const { rates: { value: rates = [] } = {} } = swap;
  const canEdit = rates.filter(r => r.provider === provider).length > 1;

  return rate && swap.rates.status !== "loading" ? (
    <Animatable.View animation="fadeIn" useNativeDriver duration={400}>
      <GenericInputLink
        label={<Trans i18nKey="transfer.swap.form.summary.provider" />}
        tooltip={<Trans i18nKey="transfer.swap.form.summary.provider" />}
      >
        {ProviderIcon ? <ProviderIcon size={12} /> : null}
        <LText semiBold style={styles.valueLabel}>
          {provider}
        </LText>
      </GenericInputLink>
      {fromUnit && toCurrency && magnitudeAwareRate ? (
        <GenericInputLink
          label={<Trans i18nKey="transfer.swap.form.summary.method" />}
          tooltip={<Trans i18nKey="transfer.swap.form.summary.method" />}
          onEdit={canEdit ? onEditRateProvider : undefined}
        >
          {tradeMethod === "fixed" ? (
            <Lock size={12} color={colors.darkBlue} />
          ) : (
            <Unlock size={12} color={colors.darkBlue} />
          )}
          <LText semiBold style={styles.valueLabel}>
            <CurrencyUnitValue
              value={BigNumber(10).pow(fromUnit.magnitude)}
              unit={fromUnit}
              showCode
            />
            {" = "}
            <CurrencyUnitValue
              unit={toCurrency.units[0]}
              value={BigNumber(10)
                .pow(fromUnit.magnitude)
                .times(magnitudeAwareRate)}
              showCode
            />
          </LText>
        </GenericInputLink>
      ) : null}

      <GenericInputLink
        label={<Trans i18nKey="send.fees.title" />}
        tooltip={<Trans i18nKey="send.fees.networkInfo" />}
        onEdit={onEditFees}
      >
        {status.estimatedFees && fromUnit ? (
          <LText semiBold style={styles.valueLabel}>
            <CurrencyUnitValue
              unit={fromUnit}
              value={status.estimatedFees}
              showCode
            />
          </LText>
        ) : null}
      </GenericInputLink>
      {toCurrency ? (
        toAccountName ? (
          <GenericInputLink
            label={<Trans i18nKey="transfer.swap.form.target" />}
            onEdit={onEditToAccount}
          >
            <CurrencyIcon currency={toCurrency} size={16} />
            <LText semiBold style={styles.valueLabel}>
              {toAccountName}
            </LText>
          </GenericInputLink>
        ) : (
          <View
            style={[
              styles.addAccountsection,
              { backgroundColor: colors.lightLive },
            ]}
          >
            <LText
              color="live"
              semiBold
              style={styles.addAccountLabel}
              numberOfLines={2}
            >
              <Trans
                i18nKey="transfer.swap.form.noAccount"
                values={{ currency: toCurrency.name }}
              />
            </LText>
            <Button
              type="primary"
              onPress={onAddAccount}
              title={<Trans i18nKey="transfer.swap.emptyState.CTAButton" />}
              containerStyle={styles.addAccountButton}
              titleStyle={styles.addAccountButtonLabel}
            />
          </View>
        )
      ) : null}
    </Animatable.View>
  ) : null;
}

const styles = StyleSheet.create({
  valueLabel: { marginLeft: 4, fontSize: 14, lineHeight: 20 },
  label: {
    fontSize: 16,
    lineHeight: 19,
  },
  addAccountsection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 4,
    padding: 12,
    marginVertical: 10,
  },
  addAccountLabel: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  addAccountButton: { height: 40 },
  addAccountButtonLabel: { fontSize: 12 },
});
