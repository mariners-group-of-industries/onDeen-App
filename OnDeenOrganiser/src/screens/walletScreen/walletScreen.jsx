import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView, View, ScrollView, Text, StyleSheet, RefreshControl, StatusBar, TouchableOpacity } from "react-native";
import { fontScale, widthScale } from "../../helpers/scale";
import Debited from '../../assets/svg/debited.svg';
import { walletTransactionsAPI } from "../../redux/slices/walletTransactionsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { fontFamilies } from "../../assets/themes/fonts";
import { apiRequest } from "../../services/api";
import { showResponce } from "../../responce/showResponce";

const HISTORY_PAGE_SIZE = 8;

export default function WalletScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [decidingRefundId, setDecidingRefundId] = useState(null);
  const [refundsExpanded, setRefundsExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const dispatch = useDispatch();
  const authToken = useSelector((state) => state.token.token?.access_token);
  const bearerToken = useSelector((state) => state.user.loginToken);

  const getparticiandatafetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(walletTransactionsAPI());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const decideRefund = async (refund, approve) => {
    setDecidingRefundId(refund.id);
    try {
      const response = await apiRequest({
        url: `/payment/refunds/${refund.id}/decision`,
        method: 'POST',
        data: { approve, amount_pence: refund.requested_amount_pence },
        authToken,
        bearerToken,
      });
      showResponce(
        response?.status
          ? (approve ? 'Refund approved - awaiting OnDeen' : 'Refund declined')
          : response?.response?.message || 'Unable to update refund',
        response?.status ? 1 : 3,
      );
      if (response?.status) {
        await getparticiandatafetchData();
      }
    } finally {
      setDecidingRefundId(null);
    }
  };

  useEffect(() => {
    getparticiandatafetchData();
  }, [getparticiandatafetchData]);

  const { wallettransactions } = useSelector((state) => state.wallettransactions);
  const refundRequests = wallettransactions?.refund_requests || [];

  const balances = wallettransactions?.balances_pence || {};
  const formatPence = value => (Number(value || 0) / 100).toFixed(2);
  const balanceCards = [
    ['Total Sales', balances.total_sales, '#EAE2FF'],
    ['Pending', balances.pending, '#FFE3ED'],
    ['Available for Payout', balances.available_for_payout, '#FFF4D4'],
    ['Payout Processing', balances.payout_processing, '#E4F0FF'],
    ['Paid Out', balances.paid_out, '#E3F7E8'],
    ['Adjustment / Negative', balances.adjustment_negative, '#F3EDF7'],
  ];

  const transactionHistory = wallettransactions?.transaction_history || [];
  const totalHistoryPages = Math.max(1, Math.ceil(transactionHistory.length / HISTORY_PAGE_SIZE));
  const visibleTransactions = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PAGE_SIZE;
    return transactionHistory.slice(start, start + HISTORY_PAGE_SIZE);
  }, [historyPage, transactionHistory]);

  useEffect(() => {
    setHistoryPage(currentPage => Math.min(currentPage, totalHistoryPages));
  }, [totalHistoryPages]);

  useFocusEffect(
    React.useCallback(() => {
      getparticiandatafetchData();
      return () => { };
    }, [getparticiandatafetchData])
  );

  // Refresh control function
  const onRefresh = () => {
    getparticiandatafetchData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={'#fff'}/>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>{"My Wallet"}</Text>

        <View style={styles.row}>
          {balanceCards.map(([label, value, color]) => (
            <View key={label} style={[styles.card, { backgroundColor: color }]}>
              <Text style={styles.cardTitle}>{label}</Text>
              <Text style={styles.amount}>{"£ "}<Text style={styles.amount1}>{formatPence(value)}</Text></Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Toggle refund requests"
            accessibilityState={{ expanded: refundsExpanded }}
            activeOpacity={0.75}
            onPress={() => setRefundsExpanded(expanded => !expanded)}
            style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.historyTitle}>Refund requests</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{refundRequests.length}</Text>
              </View>
            </View>
            <Text style={styles.collapseIcon}>{refundsExpanded ? '−' : '+'}</Text>
          </TouchableOpacity>

          {refundsExpanded ? (
            <View style={styles.sectionBody}>
              {refundRequests.length > 0 ? refundRequests.map(refund => (
                <View key={refund.id} style={styles.refundCard}>
                  <Text style={styles.refundTitle}>{refund.event_title || `Order ${refund.payment_order_key}`}</Text>
                  <Text style={styles.transactionMeta}>
                    {`${refund.buyer_name || 'Customer'} · £${formatPence(refund.requested_amount_pence)}`}
                  </Text>
                  <Text style={styles.refundStatus}>{String(refund.status || '').replaceAll('_', ' ')}</Text>
                  {refund.reason ? <Text style={styles.transactionMeta}>{refund.reason}</Text> : null}
                  {refund.status === 'requested' ? (
                    <View style={styles.refundActions}>
                      <TouchableOpacity
                        disabled={decidingRefundId === refund.id}
                        onPress={() => decideRefund(refund, false)}
                        style={styles.refundSecondaryButton}>
                        <Text style={styles.refundSecondaryText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={decidingRefundId === refund.id}
                        onPress={() => decideRefund(refund, true)}
                        style={styles.refundPrimaryButton}>
                        <Text style={styles.refundPrimaryText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              )) : (
                <Text style={styles.noData}>No refund requests</Text>
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Toggle transaction history"
            accessibilityState={{ expanded: historyExpanded }}
            activeOpacity={0.75}
            onPress={() => setHistoryExpanded(expanded => !expanded)}
            style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.historyTitle}>Transaction History</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{transactionHistory.length}</Text>
              </View>
            </View>
            <Text style={styles.collapseIcon}>{historyExpanded ? '−' : '+'}</Text>
          </TouchableOpacity>

          {historyExpanded ? (
            <View style={styles.sectionBody}>
              {transactionHistory.length > 0 ? visibleTransactions.map((transaction, index) => (
                <View
                  style={styles.transactionContainer}
                  key={transaction.transaction_id || transaction.id || `${historyPage}-${index}`}>
                  <View style={styles.transaction}>
                    <Debited width={28} height={28} />
                    <View style={styles.transactionCopy}>
                      <Text style={styles.transactionId}>{transaction.listing || `Transaction ${transaction.transaction_id}`}</Text>
                      <Text style={styles.transactionMeta}>{`${transaction.type || 'payment'} · ${transaction.status || 'recorded'}`}</Text>
                      {transaction.customer_paid_pence != null ? (
                        <Text style={styles.transactionMeta}>
                          {`Paid £${formatPence(transaction.customer_paid_pence)} · OnDeen £${formatPence(transaction.ondeen_fee_pence)} · Stripe £${formatPence(transaction.stripe_cost_pence)} · Net £${formatPence(transaction.organizer_net_pence)}`}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.transactionAmountValue}>
                      £ <Text style={styles.amount1}>{formatPence(transaction.amount_pence)}</Text>
                    </Text>
                  </View>
                  <View style={styles.divider} />
                </View>
              )) : (
                <Text style={styles.noData}>No transactions</Text>
              )}

              {transactionHistory.length > HISTORY_PAGE_SIZE ? (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Previous transaction page"
                    disabled={historyPage === 1}
                    onPress={() => setHistoryPage(page => Math.max(1, page - 1))}
                    style={[styles.pageButton, historyPage === 1 && styles.pageButtonDisabled]}>
                    <Text style={[styles.pageButtonText, historyPage === 1 && styles.pageButtonTextDisabled]}>Previous</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageIndicator}>Page {historyPage} of {totalHistoryPages}</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Next transaction page"
                    disabled={historyPage === totalHistoryPages}
                    onPress={() => setHistoryPage(page => Math.min(totalHistoryPages, page + 1))}
                    style={[styles.pageButton, historyPage === totalHistoryPages && styles.pageButtonDisabled]}>
                    <Text style={[styles.pageButtonText, historyPage === totalHistoryPages && styles.pageButtonTextDisabled]}>Next</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFF",
    paddingTop: 22,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  title: {
    color: "#191719",
    fontSize: fontScale(24),
    marginBottom: 16,
    fontWeight: '600',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,

  },
  row: {
    flexDirection: "row",
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: "#EAE2FF",
    borderRadius: 16,
    marginBottom: 12,
    minHeight: 112,
    padding: widthScale(16),
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: "#3E146F",
    fontSize: fontScale(12),
    fontWeight: '600',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  amount: {
    color: "#3E146F",
    paddingTop: 11,
    fontSize: fontScale(10),
  },
  amount1: {
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  historyTitle: {
    color: "#191719",
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E5DFEA',
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    marginLeft: 10,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEE7FA',
  },
  countBadgeText: {
    color: '#4B1A82',
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
  },
  collapseIcon: {
    color: '#4B1A82',
    fontSize: fontScale(23),
    lineHeight: fontScale(25),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  sectionBody: {
    paddingTop: 4,
  },
  transactionContainer: {
    marginTop: 16,
  },
  transaction: {
    flexDirection: "row",
    paddingBottom: 16,
    alignItems:'center',
  },
  iconContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#E5DCFF",
    borderRadius: 90,
    paddingHorizontal: 11,
    marginRight: 13,
  },
  icon: {
    marginTop: 11,
  },
  transactionId: {
    color: "#0D0615",
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,

  },
  transactionCopy: {
    flex: 1,
    paddingHorizontal: 12,
  },
  transactionMeta: {
    color: '#706A76',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: fontScale(10),
    marginTop: 3,
  },
  transactionAmount: {
    color: "#000000",
    marginHorizontal: 1,
  },
  noData: {
    color: "#000",
    fontSize: fontScale(16),
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 8,
    fontWeight: '600'
  },
  refundCard: {
    borderWidth: 1,
    borderColor: '#E1D9EA',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  refundTitle: {
    color: '#191719',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
  },
  refundStatus: {
    color: '#4B1A82',
    fontSize: fontScale(11),
    marginTop: 8,
    textTransform: 'capitalize',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  refundActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  refundSecondaryButton: {
    borderWidth: 1,
    borderColor: '#4B1A82',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  refundPrimaryButton: {
    backgroundColor: '#4B1A82',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  refundSecondaryText: {
    color: '#4B1A82',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  refundPrimaryText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  transactionAmountValue: {
    color: '#000000',
    fontSize: fontScale(10),
    fontWeight: '600',
    paddingLeft: 6,
  },
  divider: {
    backgroundColor: '#DDDBE2',
    height: 1,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 28,
  },
  pageButton: {
    minWidth: 88,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#4B1A82',
  },
  pageButtonDisabled: {
    backgroundColor: '#F0ECF4',
  },
  pageButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  pageButtonTextDisabled: {
    color: '#AAA2B1',
  },
  pageIndicator: {
    color: '#706A76',
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
});
