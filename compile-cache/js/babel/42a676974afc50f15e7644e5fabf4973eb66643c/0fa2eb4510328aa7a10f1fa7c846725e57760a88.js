var DocblockrWorker = require('./docblockr-worker.js');

module.exports = {
    config: {
        deep_indent: {
            type: 'boolean',
            'default': false
        },
        extend_double_slash: {
            type: 'boolean',
            'default': true
        },
        indentation_spaces: {
            type: 'number',
            'default': 1
        },
        indentation_spaces_same_para: {
            type: 'number',
            'default': 1
        },
        align_tags: {
            type: 'string',
            'default': 'deep',
            'enum': ['no', 'shallow', 'deep']
        },
        extra_tags: {
            type: 'array',
            'default': []
        },
        extra_tags_go_after: {
            type: 'boolean',
            'default': false
        },
        notation_map: {
            type: 'array',
            'default': []
        },
        return_tag: {
            type: 'string',
            'default': '@return'
        },
        return_description: {
            type: 'boolean',
            'default': true
        },
        param_description: {
            type: 'boolean',
            'default': true
        },
        spacer_between_sections: {
            type: 'boolean',
            'default': false
        },
        per_section_indent: {
            type: 'boolean',
            'default': false
        },
        min_spaces_between_columns: {
            type: 'number',
            'default': 1
        },
        auto_add_method_tag: {
            type: 'boolean',
            'default': false
        },
        simple_mode: {
            type: 'boolean',
            'default': false
        },
        lower_case_primitives: {
            type: 'boolean',
            'default': false
        },
        short_primitives: {
            type: 'boolean',
            'default': false
        },
        override_js_var: {
            type: 'boolean',
            'default': false
        },
        newline_after_block: {
            type: 'boolean',
            'default': false
        },
        development_mode: {
            type: 'boolean',
            'default': false
        }
    },

    activate: function activate() {
        return this.Docblockr = new DocblockrWorker();
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9kb2NibG9ja3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFFLHVCQUF1QixDQUFDLENBQUM7O0FBRXhELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDYixVQUFNLEVBQUU7QUFDSixtQkFBVyxFQUFFO0FBQ1QsZ0JBQUksRUFBRSxTQUFTO0FBQ2YsdUJBQVMsS0FBSztTQUNqQjtBQUNELDJCQUFtQixFQUFFO0FBQ2pCLGdCQUFJLEVBQUUsU0FBUztBQUNmLHVCQUFTLElBQUk7U0FDaEI7QUFDRCwwQkFBa0IsRUFBRTtBQUNoQixnQkFBSSxFQUFFLFFBQVE7QUFDZCx1QkFBUyxDQUFDO1NBQ2I7QUFDRCxvQ0FBNEIsRUFBRTtBQUMxQixnQkFBSSxFQUFFLFFBQVE7QUFDZCx1QkFBUyxDQUFDO1NBQ2I7QUFDRCxrQkFBVSxFQUFFO0FBQ1IsZ0JBQUksRUFBRSxRQUFRO0FBQ2QsdUJBQVMsTUFBTTtBQUNmLG9CQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUM7U0FDbEM7QUFDRCxrQkFBVSxFQUFFO0FBQ1IsZ0JBQUksRUFBRSxPQUFPO0FBQ2IsdUJBQVMsRUFBRTtTQUNkO0FBQ0QsMkJBQW1CLEVBQUU7QUFDakIsZ0JBQUksRUFBRSxTQUFTO0FBQ2YsdUJBQVMsS0FBSztTQUNqQjtBQUNELG9CQUFZLEVBQUU7QUFDVixnQkFBSSxFQUFFLE9BQU87QUFDYix1QkFBUyxFQUFFO1NBQ2Q7QUFDRCxrQkFBVSxFQUFFO0FBQ1IsZ0JBQUksRUFBRSxRQUFRO0FBQ2QsdUJBQVMsU0FBUztTQUNyQjtBQUNELDBCQUFrQixFQUFFO0FBQ2hCLGdCQUFJLEVBQUUsU0FBUztBQUNmLHVCQUFTLElBQUk7U0FDaEI7QUFDRCx5QkFBaUIsRUFBRTtBQUNmLGdCQUFJLEVBQUUsU0FBUztBQUNmLHVCQUFTLElBQUk7U0FDaEI7QUFDRCwrQkFBdUIsRUFBRTtBQUNyQixnQkFBSSxFQUFFLFNBQVM7QUFDZix1QkFBUyxLQUFLO1NBQ2pCO0FBQ0QsMEJBQWtCLEVBQUU7QUFDaEIsZ0JBQUksRUFBRSxTQUFTO0FBQ2YsdUJBQVMsS0FBSztTQUNqQjtBQUNELGtDQUEwQixFQUFFO0FBQ3hCLGdCQUFJLEVBQUUsUUFBUTtBQUNkLHVCQUFTLENBQUM7U0FDYjtBQUNELDJCQUFtQixFQUFFO0FBQ2pCLGdCQUFJLEVBQUUsU0FBUztBQUNmLHVCQUFTLEtBQUs7U0FDakI7QUFDRCxtQkFBVyxFQUFFO0FBQ1QsZ0JBQUksRUFBRSxTQUFTO0FBQ2YsdUJBQVMsS0FBSztTQUNqQjtBQUNELDZCQUFxQixFQUFFO0FBQ25CLGdCQUFJLEVBQUUsU0FBUztBQUNmLHVCQUFTLEtBQUs7U0FDakI7QUFDRCx3QkFBZ0IsRUFBRTtBQUNkLGdCQUFJLEVBQUUsU0FBUztBQUNmLHVCQUFTLEtBQUs7U0FDakI7QUFDRCx1QkFBZSxFQUFFO0FBQ2IsZ0JBQUksRUFBRSxTQUFTO0FBQ2YsdUJBQVMsS0FBSztTQUNqQjtBQUNELDJCQUFtQixFQUFFO0FBQ2pCLGdCQUFJLEVBQUUsU0FBUztBQUNmLHVCQUFTLEtBQUs7U0FDakI7QUFDRCx3QkFBZ0IsRUFBRTtBQUNkLGdCQUFJLEVBQUUsU0FBUztBQUNmLHVCQUFTLEtBQUs7U0FDakI7S0FDSjs7QUFFRCxZQUFRLEVBQUUsb0JBQVc7QUFDakIsZUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUU7S0FDbkQ7Q0FDSixDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9kb2NibG9ja3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgRG9jYmxvY2tyV29ya2VyID0gcmVxdWlyZSAoJy4vZG9jYmxvY2tyLXdvcmtlci5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjb25maWc6IHtcbiAgICAgICAgZGVlcF9pbmRlbnQ6IHtcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGV4dGVuZF9kb3VibGVfc2xhc2g6IHtcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgaW5kZW50YXRpb25fc3BhY2VzOiB7XG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IDFcbiAgICAgICAgfSxcbiAgICAgICAgaW5kZW50YXRpb25fc3BhY2VzX3NhbWVfcGFyYToge1xuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgICAgICBkZWZhdWx0OiAxXG4gICAgICAgIH0sXG4gICAgICAgIGFsaWduX3RhZ3M6IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgZGVmYXVsdDogJ2RlZXAnLFxuICAgICAgICAgICAgZW51bTogWydubycsICdzaGFsbG93JywgJ2RlZXAnXVxuICAgICAgICB9LFxuICAgICAgICBleHRyYV90YWdzOiB7XG4gICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgICAgZGVmYXVsdDogW11cbiAgICAgICAgfSxcbiAgICAgICAgZXh0cmFfdGFnc19nb19hZnRlcjoge1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgbm90YXRpb25fbWFwOiB7XG4gICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgICAgZGVmYXVsdDogW11cbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuX3RhZzoge1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnQHJldHVybidcbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuX2Rlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHBhcmFtX2Rlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHNwYWNlcl9iZXR3ZWVuX3NlY3Rpb25zOiB7XG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBwZXJfc2VjdGlvbl9pbmRlbnQ6IHtcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIG1pbl9zcGFjZXNfYmV0d2Vlbl9jb2x1bW5zOiB7XG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IDFcbiAgICAgICAgfSxcbiAgICAgICAgYXV0b19hZGRfbWV0aG9kX3RhZzoge1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgc2ltcGxlX21vZGU6IHtcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGxvd2VyX2Nhc2VfcHJpbWl0aXZlczoge1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgc2hvcnRfcHJpbWl0aXZlczoge1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgb3ZlcnJpZGVfanNfdmFyOiB7XG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBuZXdsaW5lX2FmdGVyX2Jsb2NrOiB7XG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBkZXZlbG9wbWVudF9tb2RlOiB7XG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5Eb2NibG9ja3IgPSBuZXcgRG9jYmxvY2tyV29ya2VyKCkpO1xuICAgIH1cbn07Il19