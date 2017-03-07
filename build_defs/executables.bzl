"""node and TypeScript compiler labels.
"""
def get_tsc():
  return Label("@typescript_compiler//:bin/tsc")

def get_node():
  return Label("@org_pubref_rules_node_toolchain//:bin/node")
